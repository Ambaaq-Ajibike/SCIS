using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SCIS.Core.DTOs;
using SCIS.Core.Entities;
using SCIS.Core.Interfaces;
using SCIS.Infrastructure.Data;
using System.Text.Json;

namespace SCIS.Infrastructure.Services;

public class HospitalSettingsService : IHospitalSettingsService
{
    private readonly SCISDbContext _context;
    private readonly IFhirValidationService _fhirValidationService;
    private readonly ILogger<HospitalSettingsService> _logger;

    public HospitalSettingsService(
        SCISDbContext context, 
        IFhirValidationService fhirValidationService,
        ILogger<HospitalSettingsService> logger)
    {
        _context = context;
        _fhirValidationService = fhirValidationService;
        _logger = logger;
    }

    public async Task<HospitalSettingsDto?> GetHospitalSettingsAsync(Guid hospitalId)
    {
        try
        {
            var settings = await _context.HospitalSettings
                .Include(hs => hs.Hospital)
                .FirstOrDefaultAsync(hs => hs.HospitalId == hospitalId && hs.IsActive);

            if (settings == null)
                return null;

            return MapToDto(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving hospital settings for hospital {HospitalId}", hospitalId);
            throw;
        }
    }

    public async Task<HospitalSettingsDto> CreateHospitalSettingsAsync(CreateHospitalSettingsDto dto)
    {
        try
        {
            // Check if hospital exists
            var hospital = await _context.Hospitals.FindAsync(Guid.Parse(dto.HospitalId));
            if (hospital == null)
            {
                throw new ArgumentException($"Hospital with ID {dto.HospitalId} not found");
            }

            // Check if settings already exist
            var existingSettings = await _context.HospitalSettings
                .FirstOrDefaultAsync(hs => hs.HospitalId == Guid.Parse(dto.HospitalId));
            
            if (existingSettings != null)
            {
                throw new InvalidOperationException($"Settings already exist for hospital {dto.HospitalId}");
            }

            var settings = new HospitalSettings
            {
                HospitalId = Guid.Parse(dto.HospitalId),
                PatientEverythingEndpoint = dto.PatientEverythingEndpoint,
                PatientEverythingEndpointParameters = dto.PatientEverythingEndpointParameters,
                ApiKey = dto.ApiKey,
                AuthToken = dto.AuthToken,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.HospitalSettings.Add(settings);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created hospital settings for hospital {HospitalId}", dto.HospitalId);

            return MapToDto(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating hospital settings for hospital {HospitalId}", dto.HospitalId);
            throw;
        }
    }

    public async Task<HospitalSettingsDto> UpdateHospitalSettingsAsync(Guid hospitalId, UpdateHospitalSettingsDto dto)
    {
        try
        {
            var settings = await _context.HospitalSettings
                .FirstOrDefaultAsync(hs => hs.HospitalId == hospitalId && hs.IsActive);

            if (settings == null)
            {
                throw new ArgumentException($"Hospital settings not found for hospital {hospitalId}");
            }

            // Update only provided fields
            if (dto.PatientEverythingEndpoint != null)
                settings.PatientEverythingEndpoint = dto.PatientEverythingEndpoint;
            if (dto.ApiKey != null)
                settings.ApiKey = dto.ApiKey;
            if (dto.AuthToken != null)
                settings.AuthToken = dto.AuthToken;
            if (dto.PatientEverythingEndpointParameters != null)
                settings.PatientEverythingEndpointParameters = dto.PatientEverythingEndpointParameters;

            settings.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated hospital settings for hospital {HospitalId}", hospitalId);

            return MapToDto(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating hospital settings for hospital {HospitalId}", hospitalId);
            throw;
        }
    }

    public async Task<bool> DeleteHospitalSettingsAsync(Guid hospitalId)
    {
        try
        {
            var settings = await _context.HospitalSettings
                .FirstOrDefaultAsync(hs => hs.HospitalId == hospitalId && hs.IsActive);

            if (settings == null)
                return false;

            settings.IsActive = false;
            settings.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted hospital settings for hospital {HospitalId}", hospitalId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting hospital settings for hospital {HospitalId}", hospitalId);
            throw;
        }
    }

    public async Task<EndpointValidationDto> ValidateEndpointAsync(string endpointUrl, string endpointType)
    {
        return await _fhirValidationService.ValidateEndpointAsync(endpointUrl, endpointType);
    }

    public async Task<HospitalSettingsDto> ValidateAllEndpointsAsync(Guid hospitalId)
    {
        try
        {
            var settings = await _context.HospitalSettings
                .Include(hs => hs.Hospital)
                .FirstOrDefaultAsync(hs => hs.HospitalId == hospitalId && hs.IsActive);

            if (settings == null)
            {
                throw new ArgumentException($"Hospital settings not found for hospital {hospitalId}");
            }

            var validationTasks = new List<Task<EndpointValidationDto>>();

            // Validate the Patient Everything endpoint
            if (!string.IsNullOrWhiteSpace(settings.PatientEverythingEndpoint))
            {
                // Build the URL with parameters for validation
                var actualUrl = settings.PatientEverythingEndpoint;
                if (!string.IsNullOrEmpty(settings.PatientEverythingEndpointParameters))
                {
                    try
                    {
                        var parameters = JsonSerializer.Deserialize<List<EndpointParameterDto>>(settings.PatientEverythingEndpointParameters);
                        if (parameters != null)
                        {
                            foreach (var param in parameters)
                            {
                                if (!string.IsNullOrEmpty(param.templatePlaceholder) && !string.IsNullOrEmpty(param.example))
                                {
                                    actualUrl = actualUrl.Replace(param.templatePlaceholder, param.example);
                                }
                            }
                        }
                    }
                    catch (JsonException ex)
                    {
                        _logger.LogWarning(ex, "Failed to parse parameters for endpoint validation");
                    }
                }
                validationTasks.Add(_fhirValidationService.ValidateEndpointAsync(actualUrl, "PatientEverything"));
            }

            var validationResults = await Task.WhenAll(validationTasks);

            // Update validation status in database
            foreach (var result in validationResults)
            {
                switch (result.EndpointType)
                {
                    case "PatientEverything":
                        settings.IsPatientEverythingEndpointValid = result.IsValid;
                        break;
                }
            }

            settings.LastValidationDate = DateTime.UtcNow;
            settings.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Validated all endpoints for hospital {HospitalId}", hospitalId);

            return MapToDto(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating endpoints for hospital {HospitalId}", hospitalId);
            throw;
        }
    }

    public async Task<List<EndpointValidationDto>> ValidateSpecificEndpointsAsync(Guid hospitalId, List<string> endpointTypes)
    {
        try
        {
            var settings = await _context.HospitalSettings
                .FirstOrDefaultAsync(hs => hs.HospitalId == hospitalId && hs.IsActive);

            if (settings == null)
            {
                throw new ArgumentException($"Hospital settings not found for hospital {hospitalId}");
            }

            var validationTasks = new List<Task<EndpointValidationDto>>();

            foreach (var endpointType in endpointTypes)
            {
                string? endpointUrl = endpointType switch
                {
                    "PatientEverything" => settings.PatientEverythingEndpoint,
                    _ => null
                };

                if (!string.IsNullOrWhiteSpace(endpointUrl))
                {
                    // Build the URL with parameters for validation
                    var actualUrl = endpointUrl;
                    if (endpointType == "PatientEverything" && !string.IsNullOrEmpty(settings.PatientEverythingEndpointParameters))
                    {
                        try
                        {
                            var parameters = JsonSerializer.Deserialize<List<EndpointParameterDto>>(settings.PatientEverythingEndpointParameters);
                            if (parameters != null)
                            {
                                foreach (var param in parameters)
                                {
                                    if (!string.IsNullOrEmpty(param.templatePlaceholder) && !string.IsNullOrEmpty(param.example))
                                    {
                                        actualUrl = actualUrl.Replace(param.templatePlaceholder, param.example);
                                    }
                                }
                            }
                        }
                        catch (JsonException ex)
                        {
                            _logger.LogWarning(ex, "Failed to parse parameters for endpoint validation");
                        }
                    }
                    validationTasks.Add(_fhirValidationService.ValidateEndpointAsync(actualUrl, endpointType));
                }
            }

            var results = await Task.WhenAll(validationTasks);
            return results.ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating specific endpoints for hospital {HospitalId}", hospitalId);
            throw;
        }
    }

    private static HospitalSettingsDto MapToDto(HospitalSettings settings)
    {
        return new HospitalSettingsDto
        {
            Id = settings.Id.ToString(),
            HospitalId = settings.HospitalId.ToString(),
            HospitalName = settings.Hospital?.Name ?? string.Empty,
            PatientEverythingEndpoint = settings.PatientEverythingEndpoint,
            ApiKey = settings.ApiKey,
            AuthToken = settings.AuthToken,
            CreatedAt = settings.CreatedAt,
            UpdatedAt = settings.UpdatedAt,
            IsActive = settings.IsActive,
            IsPatientEverythingEndpointValid = settings.IsPatientEverythingEndpointValid,
            LastValidationDate = settings.LastValidationDate,
            LastValidationError = settings.LastValidationError,
            PatientEverythingEndpointParameters = settings.PatientEverythingEndpointParameters
        };
    }
}
