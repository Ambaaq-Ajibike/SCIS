using Microsoft.EntityFrameworkCore;
using SCIS.Core.DTOs;
using SCIS.Core.Entities;
using SCIS.Core.Interfaces;
using SCIS.Infrastructure.Data;
using System.Text.Json;

namespace SCIS.Infrastructure.Services;

public class DataRequestService : IDataRequestService
{
    private readonly SCISDbContext _context;

    public DataRequestService(SCISDbContext context)
    {
        _context = context;
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

        // Check consent
        var isConsentValid = await ValidateConsentAsync(request.PatientId, requestingUserId, request.DataType);
        
        // Check role authorization
        var isRoleAuthorized = await ValidateRoleAsync(requestingUserId, request.DataType);

        var dataRequest = new DataRequest
        {
            RequestingUserId = requestingUserId,
            RequestingHospitalId = requestingUser.HospitalId ?? Guid.Empty,
            PatientId = request.PatientId,
            DataType = request.DataType,
            Purpose = request.Purpose,
            IsConsentValid = isConsentValid,
            IsRoleAuthorized = isRoleAuthorized,
            RequestDate = startTime
        };

        if (!isConsentValid || !isRoleAuthorized)
        {
            dataRequest.Status = "Denied";
            dataRequest.DenialReason = !isConsentValid ? "Patient consent not found or expired" : "Insufficient role permissions";
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
                IsConsentValid = isConsentValid,
                IsRoleAuthorized = isRoleAuthorized
            };
        }

        // Process the request
        try
        {
            var fhirData = await FormatAsFHIRAsync(request.PatientId, request.DataType);
            
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
                IsConsentValid = isConsentValid,
                IsRoleAuthorized = isRoleAuthorized
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
                IsConsentValid = isConsentValid,
                IsRoleAuthorized = isRoleAuthorized
            };
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
