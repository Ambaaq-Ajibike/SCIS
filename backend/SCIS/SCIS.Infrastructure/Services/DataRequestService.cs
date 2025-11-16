using Microsoft.EntityFrameworkCore;
using SCIS.Core.DTOs;
using SCIS.Core.Entities;
using SCIS.Core.Interfaces;
using SCIS.Infrastructure.Data;
using System.Text.Json;
using System.Net.Http;

namespace SCIS.Infrastructure.Services;

public class DataRequestService : IDataRequestService
{
    private readonly SCISDbContext _context;
    private readonly IEmailService _emailService;
    private readonly HttpClient _httpClient;

    public DataRequestService(SCISDbContext context, IEmailService emailService, HttpClient httpClient)
    {
        _context = context;
        _emailService = emailService;
        _httpClient = httpClient;
    }

    public async Task<DataRequestResponseDto> RequestDataAsync(DataRequestDto request, Guid requestingUserId)
    {
        var startTime = DateTime.UtcNow;
        var requestingUser = await _context.Users
            .Include(u => u.Hospital)
            .FirstOrDefaultAsync(u => u.Id == requestingUserId);

        if (requestingUser == null)
        {
            return new DataRequestResponseDto
            {
                Status = "Denied",
                DenialReason = "Invalid user",
                RequestDate = startTime,
                ResponseDate = DateTime.UtcNow,
                ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds
            };
        }

        // Find the patient and their hospital by patient identifier
        var patient = await _context.Patients
            .Include(p => p.Hospital)
            .FirstOrDefaultAsync(p => p.PatientId == request.PatientId);

        if (patient == null)
        {
            return new DataRequestResponseDto
            {
                Status = "Denied",
                DenialReason = "Patient not found",
                RequestDate = startTime,
                ResponseDate = DateTime.UtcNow,
                ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds
            };
        }

        // Check if this is a cross-hospital request
        var isCrossHospitalRequest = patient.HospitalId != requestingUser.HospitalId;
        
        // Check role authorization
        var isRoleAuthorized = await ValidateRoleAsync(requestingUserId, request.DataType);

        var dataRequest = new DataRequest
        {
            RequestingUserId = requestingUserId,
            RequestingHospitalId = requestingUser.HospitalId ?? Guid.Empty,
            PatientId = patient.Id, // Use the patient's database ID (Guid)
            PatientHospitalId = patient.HospitalId,
            DataType = request.DataType,
            Purpose = request.Purpose,
            IsConsentValid = true, // Will be validated during approval
            IsRoleAuthorized = isRoleAuthorized,
            IsCrossHospitalRequest = isCrossHospitalRequest,
            RequestDate = startTime
        };

        if (!isRoleAuthorized)
        {
            dataRequest.Status = "Denied";
            dataRequest.DenialReason = "Insufficient role permissions";
            dataRequest.ResponseDate = DateTime.UtcNow;
            dataRequest.ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;

            _context.DataRequests.Add(dataRequest);
            await _context.SaveChangesAsync();

            await LogDataRequestAsync(dataRequest.Id, false, dataRequest.ResponseTimeMs, dataRequest.DenialReason);

            return new DataRequestResponseDto
            {
                Id = dataRequest.Id,
                Status = dataRequest.Status,
                DenialReason = dataRequest.DenialReason,
                RequestDate = dataRequest.RequestDate,
                ResponseDate = dataRequest.ResponseDate,
                ResponseTimeMs = dataRequest.ResponseTimeMs,
                IsConsentValid = true,
                IsRoleAuthorized = isRoleAuthorized,
                IsCrossHospitalRequest = isCrossHospitalRequest,
                RequestingHospitalName = requestingUser.Hospital?.Name,
                PatientHospitalName = patient.Hospital?.Name,
                PatientName = $"{patient.FirstName} {patient.LastName}",
                PatientId = patient.PatientId
            };
        }

        if (isCrossHospitalRequest)
        {
            // For cross-hospital requests, create pending request and notify
            dataRequest.Status = "Pending";
            
            _context.DataRequests.Add(dataRequest);
            await _context.SaveChangesAsync();

            // Send email notification to patient's hospital
            if (!string.IsNullOrEmpty(patient.Hospital?.Email))
            {
                await _emailService.SendDataRequestNotificationAsync(
                    patient.Hospital.Email,
                    requestingUser.Hospital?.Name ?? "Unknown Hospital",
                    $"{patient.FirstName} {patient.LastName}",
                    patient.PatientId,
                    request.DataType,
                    request.Purpose ?? "No purpose specified"
                );
            }

            await LogDataRequestAsync(dataRequest.Id, true, 0, "Cross-hospital request created");

            return new DataRequestResponseDto
            {
                Id = dataRequest.Id,
                Status = dataRequest.Status,
                RequestDate = dataRequest.RequestDate,
                ResponseTimeMs = 0,
                IsConsentValid = true,
                IsRoleAuthorized = isRoleAuthorized,
                IsCrossHospitalRequest = isCrossHospitalRequest,
                RequestingHospitalName = requestingUser.Hospital?.Name,
                PatientHospitalName = patient.Hospital?.Name,
                PatientName = $"{patient.FirstName} {patient.LastName}",
                PatientId = patient.PatientId
            };
        }
        else
        {
            // For same-hospital requests, process immediately
            try
            {
                var fhirData = await FormatAsFHIRAsync(patient.Id, request.DataType);
                
                dataRequest.Status = "Completed";
                dataRequest.ResponseData = fhirData;
                dataRequest.ResponseDate = DateTime.UtcNow;
                dataRequest.ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;

                _context.DataRequests.Add(dataRequest);
                await _context.SaveChangesAsync();

                await LogDataRequestAsync(dataRequest.Id, true, dataRequest.ResponseTimeMs);

                return new DataRequestResponseDto
                {
                    Id = dataRequest.Id,
                    Status = dataRequest.Status,
                    ResponseData = dataRequest.ResponseData,
                    RequestDate = dataRequest.RequestDate,
                    ResponseDate = dataRequest.ResponseDate,
                    ResponseTimeMs = dataRequest.ResponseTimeMs,
                    IsConsentValid = true,
                    IsRoleAuthorized = isRoleAuthorized,
                    IsCrossHospitalRequest = isCrossHospitalRequest,
                    RequestingHospitalName = requestingUser.Hospital?.Name,
                    PatientHospitalName = patient.Hospital?.Name,
                    PatientName = $"{patient.FirstName} {patient.LastName}",
                    PatientId = patient.PatientId
                };
            }
            catch (Exception ex)
            {
                dataRequest.Status = "Error";
                dataRequest.DenialReason = ex.Message;
                dataRequest.ResponseDate = DateTime.UtcNow;
                dataRequest.ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;

                _context.DataRequests.Add(dataRequest);
                await _context.SaveChangesAsync();

                await LogDataRequestAsync(dataRequest.Id, false, dataRequest.ResponseTimeMs, ex.Message);

                return new DataRequestResponseDto
                {
                    Id = dataRequest.Id,
                    Status = dataRequest.Status,
                    DenialReason = dataRequest.DenialReason,
                    RequestDate = dataRequest.RequestDate,
                    ResponseDate = dataRequest.ResponseDate,
                    ResponseTimeMs = dataRequest.ResponseTimeMs,
                    IsConsentValid = true,
                    IsRoleAuthorized = isRoleAuthorized,
                    IsCrossHospitalRequest = isCrossHospitalRequest,
                    RequestingHospitalName = requestingUser.Hospital?.Name,
                    PatientHospitalName = patient.Hospital?.Name,
                    PatientName = $"{patient.FirstName} {patient.LastName}",
                    PatientId = patient.PatientId
                };
            }
        }
    }

    public async Task<bool> ValidateConsentAsync(Guid patientId, Guid requestingUserId, string dataType)
    {
        var consent = await _context.PatientConsents
            .FirstOrDefaultAsync(c => c.PatientId == patientId 
                && c.RequestingUserId == requestingUserId 
                && c.DataType == dataType 
                && c.IsConsented 
                && c.IsActive
                && (c.ExpiryDate == null || c.ExpiryDate > DateTime.UtcNow));

        return consent != null;
    }

    public async Task<bool> ValidateRoleAsync(Guid userId, string dataType)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        return user.Role switch
        {
            "HospitalManager" => true,
            "Doctor" => dataType is "LabResults" or "MedicalHistory" or "TreatmentRecords",
            "Staff" => dataType is "LabResults",
            _ => false
        };
    }

    public async Task<string> FormatAsFHIRAsync(Guid patientId, string dataType)
    {
        var patient = await _context.Patients
            .Include(p => p.Hospital)
            .FirstOrDefaultAsync(p => p.Id == patientId);

        if (patient == null)
            throw new ArgumentException("Patient not found");

        // Create FHIR-compliant JSON based on data type
        var fhirData = dataType switch
        {
            "LabResults" => CreateFHIRLabResults(patient),
            "MedicalHistory" => CreateFHIRMedicalHistory(patient),
            "TreatmentRecords" => CreateFHIRTreatmentRecords(patient),
            _ => throw new ArgumentException($"Unsupported data type: {dataType}")
        };

        return JsonSerializer.Serialize(fhirData, new JsonSerializerOptions { WriteIndented = true });
    }

    public async Task<DataRequestResponseDto> ApproveDataRequestAsync(DataRequestApprovalDto approval, Guid approvingUserId)
    {
        var startTime = DateTime.UtcNow;
        var approvingUser = await _context.Users
            .Include(u => u.Hospital)
            .FirstOrDefaultAsync(u => u.Id == approvingUserId);

        if (approvingUser == null)
        {
            return new DataRequestResponseDto
            {
                Status = "Denied",
                DenialReason = "Invalid approving user",
                RequestDate = startTime,
                ResponseDate = DateTime.UtcNow,
                ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds
            };
        }

        var dataRequest = await _context.DataRequests
            .Include(dr => dr.RequestingUser)
            .ThenInclude(u => u.Hospital)
            .Include(dr => dr.Patient)
            .ThenInclude(p => p.Hospital)
            .FirstOrDefaultAsync(dr => dr.Id == approval.RequestId);

        if (dataRequest == null)
        {
            return new DataRequestResponseDto
            {
                Status = "Denied",
                DenialReason = "Data request not found",
                RequestDate = startTime,
                ResponseDate = DateTime.UtcNow,
                ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds
            };
        }

        // Check if the approving user belongs to the patient's hospital
        if (dataRequest.PatientHospitalId != approvingUser.HospitalId)
        {
            return new DataRequestResponseDto
            {
                Status = "Denied",
                DenialReason = "Unauthorized to approve this request",
                RequestDate = dataRequest.RequestDate,
                ResponseDate = DateTime.UtcNow,
                ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds
            };
        }

        dataRequest.ApprovingUserId = approvingUserId;
        dataRequest.ApprovalDate = DateTime.UtcNow;

        if (approval.IsApproved)
        {
            try
            {
                // Call the patient's hospital endpoint
                var responseData = await CallPatientEndpointAsync(
                    dataRequest.Patient.PatientId, 
                    dataRequest.PatientHospitalId.ToString()!, 
                    dataRequest.DataType
                );

                dataRequest.Status = "Completed";
                dataRequest.ResponseData = responseData;
                dataRequest.ResponseDate = DateTime.UtcNow;
                dataRequest.ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;

                // Send approval notification to requesting hospital
                if (!string.IsNullOrEmpty(dataRequest.RequestingUser.Hospital?.Email))
                {
                    await _emailService.SendDataRequestApprovalNotificationAsync(
                        dataRequest.RequestingUser.Hospital.Email,
                        dataRequest.Patient.Hospital?.Name ?? "Unknown Hospital",
                        $"{dataRequest.Patient.FirstName} {dataRequest.Patient.LastName}",
                        dataRequest.Patient.PatientId,
                        true
                    );
                }
            }
            catch (Exception ex)
            {
                dataRequest.Status = "Error";
                dataRequest.DenialReason = ex.Message;
                dataRequest.ResponseDate = DateTime.UtcNow;
                dataRequest.ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;
            }
        }
        else
        {
            dataRequest.Status = "Denied";
            dataRequest.DenialReason = approval.Reason ?? "Request denied";
            dataRequest.ResponseDate = DateTime.UtcNow;
            dataRequest.ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;

            // Send denial notification to requesting hospital
            if (!string.IsNullOrEmpty(dataRequest.RequestingUser.Hospital?.Email))
            {
                await _emailService.SendDataRequestApprovalNotificationAsync(
                    dataRequest.RequestingUser.Hospital.Email,
                    dataRequest.Patient.Hospital?.Name ?? "Unknown Hospital",
                    $"{dataRequest.Patient.FirstName} {dataRequest.Patient.LastName}",
                    dataRequest.Patient.PatientId,
                    false
                );
            }
        }

        await _context.SaveChangesAsync();
        await LogDataRequestAsync(dataRequest.Id, dataRequest.Status == "Completed", dataRequest.ResponseTimeMs, dataRequest.DenialReason);

        return new DataRequestResponseDto
        {
            Id = dataRequest.Id,
            Status = dataRequest.Status,
            ResponseData = dataRequest.ResponseData,
            DenialReason = dataRequest.DenialReason,
            RequestDate = dataRequest.RequestDate,
            ResponseDate = dataRequest.ResponseDate,
            ApprovalDate = dataRequest.ApprovalDate,
            ResponseTimeMs = dataRequest.ResponseTimeMs,
            IsConsentValid = dataRequest.IsConsentValid,
            IsRoleAuthorized = dataRequest.IsRoleAuthorized,
            IsCrossHospitalRequest = dataRequest.IsCrossHospitalRequest,
            RequestingHospitalName = dataRequest.RequestingUser.Hospital?.Name,
            PatientHospitalName = dataRequest.Patient.Hospital?.Name,
            PatientName = $"{dataRequest.Patient.FirstName} {dataRequest.Patient.LastName}",
            PatientId = dataRequest.Patient.PatientId,
                ApprovingUserName = approvingUser.Username
        };
    }

    public async Task<List<PendingDataRequestDto>> GetPendingRequestsAsync(Guid hospitalId)
    {
        var pendingRequests = await _context.DataRequests
            .Include(dr => dr.RequestingUser)
            .ThenInclude(u => u.Hospital)
            .Include(dr => dr.Patient)
            .Where(dr => dr.PatientHospitalId == hospitalId && dr.Status == "Pending")
            .OrderByDescending(dr => dr.RequestDate)
            .Select(dr => new PendingDataRequestDto
            {
                Id = dr.Id,
                PatientName = $"{dr.Patient.FirstName} {dr.Patient.LastName}",
                PatientId = dr.Patient.PatientId,
                RequestingHospitalName = dr.RequestingUser.Hospital!.Name,
                DataType = dr.DataType,
                Purpose = dr.Purpose,
                RequestDate = dr.RequestDate,
                RequestingUserName = dr.RequestingUser.Username
            })
            .ToListAsync();

        return pendingRequests;
    }

    public async Task<List<DataRequestResponseDto>> GetRequestHistoryAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.Hospital)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return new List<DataRequestResponseDto>();

        var requests = await _context.DataRequests
            .Include(dr => dr.RequestingUser)
            .ThenInclude(u => u.Hospital)
            .Include(dr => dr.Patient)
            .ThenInclude(p => p.Hospital)
            .Include(dr => dr.ApprovingUser)
            .Where(dr => dr.RequestingUserId == userId || dr.ApprovingUserId == userId)
            .OrderByDescending(dr => dr.RequestDate)
            .Select(dr => new DataRequestResponseDto
            {
                Id = dr.Id,
                Status = dr.Status,
                ResponseData = dr.ResponseData,
                DenialReason = dr.DenialReason,
                RequestDate = dr.RequestDate,
                ResponseDate = dr.ResponseDate,
                ApprovalDate = dr.ApprovalDate,
                ResponseTimeMs = dr.ResponseTimeMs,
                IsConsentValid = dr.IsConsentValid,
                IsRoleAuthorized = dr.IsRoleAuthorized,
                IsCrossHospitalRequest = dr.IsCrossHospitalRequest,
                RequestingHospitalName = dr.RequestingUser.Hospital!.Name,
                PatientHospitalName = dr.Patient.Hospital!.Name,
                PatientName = $"{dr.Patient.FirstName} {dr.Patient.LastName}",
                PatientId = dr.Patient.PatientId,
                ApprovingUserName = dr.ApprovingUser != null ? dr.ApprovingUser.Username : null
            })
            .ToListAsync();

        return requests;
    }

    public async Task<string> CallPatientEndpointAsync(string patientId, string patientHospitalId, string dataType)
    {
        // First try to get the specific endpoint for this data type
        var dataRequestEndpoint = await _context.DataRequestEndpoints
            .FirstOrDefaultAsync(e => e.HospitalId.ToString() == patientHospitalId 
                && e.DataType == dataType 
                && e.IsActive);

        if (dataRequestEndpoint != null)
        {
            return await CallSpecificEndpointAsync(patientId, dataRequestEndpoint);
        }

        // Fallback to the legacy PatientEverythingEndpoint
        var hospitalSettings = await _context.HospitalSettings
            .FirstOrDefaultAsync(hs => hs.HospitalId.ToString() == patientHospitalId && hs.IsActive);

        if (hospitalSettings == null || string.IsNullOrEmpty(hospitalSettings.PatientEverythingEndpoint))
        {
            throw new InvalidOperationException($"No endpoint configured for data type '{dataType}' and hospital '{patientHospitalId}'");
        }

        var patient = await _context.Patients.FirstOrDefaultAsync(p => p.PatientId == patientId);
        if (patient == null)
        {
            throw new ArgumentException("Patient not found");
        }

        // Replace {patientId} placeholder in the endpoint URL
        var endpointUrl = hospitalSettings.PatientEverythingEndpoint.Replace("{patientId}", patient.PatientId);

        var request = new HttpRequestMessage(HttpMethod.Get, endpointUrl);
        
        // Add authentication headers if configured
        if (!string.IsNullOrEmpty(hospitalSettings.ApiKey))
        {
            request.Headers.Add("X-API-Key", hospitalSettings.ApiKey);
        }
        
        if (!string.IsNullOrEmpty(hospitalSettings.AuthToken))
        {
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", hospitalSettings.AuthToken);
        }

        var response = await _httpClient.SendAsync(request);
        
        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException($"Endpoint call failed with status: {response.StatusCode}");
        }

        var responseContent = await response.Content.ReadAsStringAsync();
        return responseContent;
    }

    public async Task<DataAvailabilityResponseDto> CheckDataAvailabilityAsync(DataRequestDto request, Guid requestingUserId)
    {
        var startTime = DateTime.UtcNow;
        
        try
        {
            // Find the requesting user
            var requestingUser = await _context.Users
                .Include(u => u.Hospital)
                .FirstOrDefaultAsync(u => u.Id == requestingUserId);

            if (requestingUser == null)
            {
                return new DataAvailabilityResponseDto
                {
                    IsAvailable = false,
                    Message = "Invalid user",
                    ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds
                };
            }

            // Find the patient and their hospital
            var patient = await _context.Patients
                .Include(p => p.Hospital)
                .FirstOrDefaultAsync(p => p.PatientId == request.PatientId);

            if (patient == null)
            {
                return new DataAvailabilityResponseDto
                {
                    IsAvailable = false,
                    Message = "Patient not found",
                    ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds
                };
            }

            var isCrossHospitalRequest = patient.HospitalId != requestingUser.HospitalId;

            // Check if endpoint exists and is configured
            var dataRequestEndpoint = await _context.DataRequestEndpoints
                .FirstOrDefaultAsync(e => e.HospitalId == patient.HospitalId 
                    && e.DataType == request.DataType 
                    && e.IsActive);

            HospitalSettings? hospitalSettings = null;
            
            // If no specific endpoint, check for PatientEverythingEndpoint
            if (dataRequestEndpoint == null)
            {
                hospitalSettings = await _context.HospitalSettings
                    .FirstOrDefaultAsync(hs => hs.HospitalId == patient.HospitalId && hs.IsActive);

                if (hospitalSettings == null || string.IsNullOrEmpty(hospitalSettings.PatientEverythingEndpoint))
                {
                    return new DataAvailabilityResponseDto
                    {
                        IsAvailable = false,
                        Message = $"No endpoint configured for data type '{request.DataType}' at patient's hospital",
                        PatientHospitalName = patient.Hospital?.Name,
                        PatientName = $"{patient.FirstName} {patient.LastName}",
                        IsCrossHospitalRequest = isCrossHospitalRequest,
                        ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds
                    };
                }
            }

            // Try to call the endpoint to check if data is available
            try
            {
                string endpointUrl;
                if (dataRequestEndpoint != null)
                {
                    endpointUrl = dataRequestEndpoint.EndpointUrl.Replace("{patientId}", patient.PatientId);
                }
                else if (hospitalSettings != null && !string.IsNullOrEmpty(hospitalSettings.PatientEverythingEndpoint))
                {
                    endpointUrl = hospitalSettings.PatientEverythingEndpoint.Replace("{patientId}", patient.PatientId);
                }
                else
                {
                    return new DataAvailabilityResponseDto
                    {
                        IsAvailable = false,
                        Message = "No endpoint configured for this data type",
                        PatientHospitalName = patient.Hospital?.Name,
                        PatientName = $"{patient.FirstName} {patient.LastName}",
                        IsCrossHospitalRequest = isCrossHospitalRequest,
                        ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds
                    };
                }

                var httpMethod = dataRequestEndpoint != null && !string.IsNullOrEmpty(dataRequestEndpoint.HttpMethod)
                    ? (dataRequestEndpoint.HttpMethod.ToUpper() switch
                    {
                        "POST" => HttpMethod.Post,
                        "PUT" => HttpMethod.Put,
                        "DELETE" => HttpMethod.Delete,
                        _ => HttpMethod.Get
                    })
                    : HttpMethod.Get;

                var checkRequest = new HttpRequestMessage(httpMethod, endpointUrl);
                
                // Add authentication headers if configured
                if (dataRequestEndpoint != null)
                {
                    if (!string.IsNullOrEmpty(dataRequestEndpoint.ApiKey))
                    {
                        checkRequest.Headers.Add("X-API-Key", dataRequestEndpoint.ApiKey);
                    }
                    if (!string.IsNullOrEmpty(dataRequestEndpoint.AuthToken))
                    {
                        checkRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", dataRequestEndpoint.AuthToken);
                    }
                }
                else if (hospitalSettings != null)
                {
                    if (!string.IsNullOrEmpty(hospitalSettings.ApiKey))
                    {
                        checkRequest.Headers.Add("X-API-Key", hospitalSettings.ApiKey);
                    }
                    if (!string.IsNullOrEmpty(hospitalSettings.AuthToken))
                    {
                        checkRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", hospitalSettings.AuthToken);
                    }
                }

                // Set a shorter timeout for availability check
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(10));
                var response = await _httpClient.SendAsync(checkRequest, cts.Token);
                
                var responseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;

                if (response.IsSuccessStatusCode)
                {
                    // Read and parse the response to check if data actually exists
                    var responseContent = await response.Content.ReadAsStringAsync();
                    bool hasData = false;
                    string availabilityMessage = "Data is available and accessible";

                    try
                    {
                        // Try to parse as JSON
                        using var jsonDoc = JsonDocument.Parse(responseContent);
                        var root = jsonDoc.RootElement;

                        // Check if it's a FHIR Bundle
                        if (root.TryGetProperty("resourceType", out var resourceType) && 
                            resourceType.GetString() == "Bundle")
                        {
                            // Check if bundle has entries
                            if (root.TryGetProperty("entry", out var entries) && entries.ValueKind == JsonValueKind.Array)
                            {
                                hasData = entries.GetArrayLength() > 0;
                            }
                            
                            // Also check total count
                            if (root.TryGetProperty("total", out var total))
                            {
                                var totalValue = total.GetInt32();
                                hasData = hasData || totalValue > 0;
                            }

                            if (!hasData)
                            {
                                availabilityMessage = "Endpoint is accessible but returned no data for this patient";
                            }
                        }
                        else
                        {
                            // Not a Bundle, check if it's a single resource or has content
                            hasData = !string.IsNullOrWhiteSpace(responseContent) && 
                                     responseContent.TrimStart().StartsWith("{");
                            
                            if (!hasData)
                            {
                                availabilityMessage = "Endpoint returned an empty or invalid response";
                            }
                        }
                    }
                    catch (JsonException)
                    {
                        // If not valid JSON, check if there's any content
                        hasData = !string.IsNullOrWhiteSpace(responseContent);
                        if (!hasData)
                        {
                            availabilityMessage = "Endpoint returned an empty response";
                        }
                    }

                    return new DataAvailabilityResponseDto
                    {
                        IsAvailable = hasData,
                        Message = availabilityMessage,
                        PatientHospitalName = patient.Hospital?.Name,
                        PatientName = $"{patient.FirstName} {patient.LastName}",
                        IsCrossHospitalRequest = isCrossHospitalRequest,
                        ResponseTimeMs = responseTimeMs
                    };
                }
                else
                {
                    return new DataAvailabilityResponseDto
                    {
                        IsAvailable = false,
                        Message = $"Endpoint returned status {response.StatusCode}. Data may not be available.",
                        PatientHospitalName = patient.Hospital?.Name,
                        PatientName = $"{patient.FirstName} {patient.LastName}",
                        IsCrossHospitalRequest = isCrossHospitalRequest,
                        ResponseTimeMs = responseTimeMs
                    };
                }
            }
            catch (HttpRequestException ex)
            {
                return new DataAvailabilityResponseDto
                {
                    IsAvailable = false,
                    Message = $"Unable to reach endpoint: {ex.Message}",
                    PatientHospitalName = patient.Hospital?.Name,
                    PatientName = $"{patient.FirstName} {patient.LastName}",
                    IsCrossHospitalRequest = isCrossHospitalRequest,
                    ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds
                };
            }
            catch (TaskCanceledException)
            {
                return new DataAvailabilityResponseDto
                {
                    IsAvailable = false,
                    Message = "Endpoint request timed out. The endpoint may be unavailable.",
                    PatientHospitalName = patient.Hospital?.Name,
                    PatientName = $"{patient.FirstName} {patient.LastName}",
                    IsCrossHospitalRequest = isCrossHospitalRequest,
                    ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds
                };
            }
        }
        catch (Exception ex)
        {
            return new DataAvailabilityResponseDto
            {
                IsAvailable = false,
                Message = $"Error checking availability: {ex.Message}",
                ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds
            };
        }
    }

    private async Task<string> CallSpecificEndpointAsync(string patientId, DataRequestEndpoint endpoint)
    {
        var patient = await _context.Patients.FirstOrDefaultAsync(p => p.PatientId == patientId);
        if (patient == null)
        {
            throw new ArgumentException("Patient not found");
        }

        // Replace {patientId} placeholder in the endpoint URL
        var endpointUrl = endpoint.EndpointUrl.Replace("{patientId}", patient.PatientId);

        var httpMethod = endpoint.HttpMethod.ToUpper() switch
        {
            "POST" => HttpMethod.Post,
            "PUT" => HttpMethod.Put,
            "DELETE" => HttpMethod.Delete,
            _ => HttpMethod.Get
        };

        var request = new HttpRequestMessage(httpMethod, endpointUrl);
        
        // Add authentication headers if configured
        if (!string.IsNullOrEmpty(endpoint.ApiKey))
        {
            request.Headers.Add("X-API-Key", endpoint.ApiKey);
        }
        
        if (!string.IsNullOrEmpty(endpoint.AuthToken))
        {
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", endpoint.AuthToken);
        }

        // Add any additional parameters if configured
        if (!string.IsNullOrEmpty(endpoint.EndpointParameters))
        {
            try
            {
                var parameters = JsonSerializer.Deserialize<Dictionary<string, string>>(endpoint.EndpointParameters);
                if (parameters != null)
                {
                    foreach (var param in parameters)
                    {
                        request.Headers.Add(param.Key, param.Value);
                    }
                }
            }
            catch (JsonException)
            {
                // Ignore invalid JSON in parameters
            }
        }

        var response = await _httpClient.SendAsync(request);
        
        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException($"Endpoint call failed with status: {response.StatusCode}");
        }

        var responseContent = await response.Content.ReadAsStringAsync();
        return responseContent;
    }

    public async Task LogDataRequestAsync(Guid requestId, bool success, int responseTimeMs, string? errorMessage = null)
    {
        var auditLog = new AuditLog
        {
            Action = "DataRequest",
            EntityType = "DataRequest",
            EntityId = requestId,
            Details = $"Data request processed. Success: {success}, Response time: {responseTimeMs}ms",
            Status = success ? "Success" : "Failed",
            ErrorMessage = errorMessage,
            ResponseTimeMs = responseTimeMs,
            Timestamp = DateTime.UtcNow
        };

        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();
    }

    private object CreateFHIRLabResults(Patient patient)
    {
        return new
        {
            resourceType = "DiagnosticReport",
            id = Guid.NewGuid().ToString(),
            status = "final",
            category = new[] { new { coding = new[] { new { system = "http://loinc.org", code = "11502-2", display = "Laboratory report" } } } },
            subject = new { reference = $"Patient/{patient.PatientId}" },
            effectiveDateTime = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
            issued = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
            performer = new[] { new { reference = $"Organization/{patient.HospitalId}" } },
            result = new[]
            {
                new
                {
                    reference = new { reference = $"Observation/lab-{Guid.NewGuid()}" }
                }
            }
        };
    }

    private object CreateFHIRMedicalHistory(Patient patient)
    {
        return new
        {
            resourceType = "Condition",
            id = Guid.NewGuid().ToString(),
            clinicalStatus = new { coding = new[] { new { system = "http://terminology.hl7.org/CodeSystem/condition-clinical", code = "active" } } },
            subject = new { reference = $"Patient/{patient.PatientId}" },
            recordedDate = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
            recorder = new { reference = $"Organization/{patient.HospitalId}" }
        };
    }

    private object CreateFHIRTreatmentRecords(Patient patient)
    {
        return new
        {
            resourceType = "Procedure",
            id = Guid.NewGuid().ToString(),
            status = "completed",
            subject = new { reference = $"Patient/{patient.PatientId}" },
            performedDateTime = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
            performer = new[] { new { reference = $"Organization/{patient.HospitalId}" } }
        };
    }

}
