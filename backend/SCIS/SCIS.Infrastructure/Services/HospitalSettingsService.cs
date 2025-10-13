using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SCIS.Core.DTOs;
using SCIS.Core.Entities;
using SCIS.Core.Interfaces;
using SCIS.Infrastructure.Data;

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
                DataRequestEndpoint = dto.DataRequestEndpoint,
                PatientEndpoint = dto.PatientEndpoint,
                ObservationEndpoint = dto.ObservationEndpoint,
                ConditionEndpoint = dto.ConditionEndpoint,
                MedicationEndpoint = dto.MedicationEndpoint,
                DiagnosticReportEndpoint = dto.DiagnosticReportEndpoint,
                ProcedureEndpoint = dto.ProcedureEndpoint,
                EncounterEndpoint = dto.EncounterEndpoint,
                AllergyIntoleranceEndpoint = dto.AllergyIntoleranceEndpoint,
                ImmunizationEndpoint = dto.ImmunizationEndpoint,
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
            if (dto.DataRequestEndpoint != null)
                settings.DataRequestEndpoint = dto.DataRequestEndpoint;
            if (dto.PatientEndpoint != null)
                settings.PatientEndpoint = dto.PatientEndpoint;
            if (dto.ObservationEndpoint != null)
                settings.ObservationEndpoint = dto.ObservationEndpoint;
            if (dto.ConditionEndpoint != null)
                settings.ConditionEndpoint = dto.ConditionEndpoint;
            if (dto.MedicationEndpoint != null)
                settings.MedicationEndpoint = dto.MedicationEndpoint;
            if (dto.DiagnosticReportEndpoint != null)
                settings.DiagnosticReportEndpoint = dto.DiagnosticReportEndpoint;
            if (dto.ProcedureEndpoint != null)
                settings.ProcedureEndpoint = dto.ProcedureEndpoint;
            if (dto.EncounterEndpoint != null)
                settings.EncounterEndpoint = dto.EncounterEndpoint;
            if (dto.AllergyIntoleranceEndpoint != null)
                settings.AllergyIntoleranceEndpoint = dto.AllergyIntoleranceEndpoint;
            if (dto.ImmunizationEndpoint != null)
                settings.ImmunizationEndpoint = dto.ImmunizationEndpoint;
            if (dto.ApiKey != null)
                settings.ApiKey = dto.ApiKey;
            if (dto.AuthToken != null)
                settings.AuthToken = dto.AuthToken;

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

            // Validate all configured endpoints
            if (!string.IsNullOrWhiteSpace(settings.DataRequestEndpoint))
                validationTasks.Add(_fhirValidationService.ValidateEndpointAsync(settings.DataRequestEndpoint, "DataRequest"));
            
            if (!string.IsNullOrWhiteSpace(settings.PatientEndpoint))
                validationTasks.Add(_fhirValidationService.ValidateEndpointAsync(settings.PatientEndpoint, "Patient"));
            
            if (!string.IsNullOrWhiteSpace(settings.ObservationEndpoint))
                validationTasks.Add(_fhirValidationService.ValidateEndpointAsync(settings.ObservationEndpoint, "Observation"));
            
            if (!string.IsNullOrWhiteSpace(settings.ConditionEndpoint))
                validationTasks.Add(_fhirValidationService.ValidateEndpointAsync(settings.ConditionEndpoint, "Condition"));
            
            if (!string.IsNullOrWhiteSpace(settings.MedicationEndpoint))
                validationTasks.Add(_fhirValidationService.ValidateEndpointAsync(settings.MedicationEndpoint, "Medication"));
            
            if (!string.IsNullOrWhiteSpace(settings.DiagnosticReportEndpoint))
                validationTasks.Add(_fhirValidationService.ValidateEndpointAsync(settings.DiagnosticReportEndpoint, "DiagnosticReport"));
            
            if (!string.IsNullOrWhiteSpace(settings.ProcedureEndpoint))
                validationTasks.Add(_fhirValidationService.ValidateEndpointAsync(settings.ProcedureEndpoint, "Procedure"));
            
            if (!string.IsNullOrWhiteSpace(settings.EncounterEndpoint))
                validationTasks.Add(_fhirValidationService.ValidateEndpointAsync(settings.EncounterEndpoint, "Encounter"));
            
            if (!string.IsNullOrWhiteSpace(settings.AllergyIntoleranceEndpoint))
                validationTasks.Add(_fhirValidationService.ValidateEndpointAsync(settings.AllergyIntoleranceEndpoint, "AllergyIntolerance"));
            
            if (!string.IsNullOrWhiteSpace(settings.ImmunizationEndpoint))
                validationTasks.Add(_fhirValidationService.ValidateEndpointAsync(settings.ImmunizationEndpoint, "Immunization"));

            var validationResults = await Task.WhenAll(validationTasks);

            // Update validation status in database
            foreach (var result in validationResults)
            {
                switch (result.EndpointType)
                {
                    case "DataRequest":
                        settings.IsDataRequestEndpointValid = result.IsValid;
                        break;
                    case "Patient":
                        settings.IsPatientEndpointValid = result.IsValid;
                        break;
                    case "Observation":
                        settings.IsObservationEndpointValid = result.IsValid;
                        break;
                    case "Condition":
                        settings.IsConditionEndpointValid = result.IsValid;
                        break;
                    case "Medication":
                        settings.IsMedicationEndpointValid = result.IsValid;
                        break;
                    case "DiagnosticReport":
                        settings.IsDiagnosticReportEndpointValid = result.IsValid;
                        break;
                    case "Procedure":
                        settings.IsProcedureEndpointValid = result.IsValid;
                        break;
                    case "Encounter":
                        settings.IsEncounterEndpointValid = result.IsValid;
                        break;
                    case "AllergyIntolerance":
                        settings.IsAllergyIntoleranceEndpointValid = result.IsValid;
                        break;
                    case "Immunization":
                        settings.IsImmunizationEndpointValid = result.IsValid;
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
                    "DataRequest" => settings.DataRequestEndpoint,
                    "Patient" => settings.PatientEndpoint,
                    "Observation" => settings.ObservationEndpoint,
                    "Condition" => settings.ConditionEndpoint,
                    "Medication" => settings.MedicationEndpoint,
                    "DiagnosticReport" => settings.DiagnosticReportEndpoint,
                    "Procedure" => settings.ProcedureEndpoint,
                    "Encounter" => settings.EncounterEndpoint,
                    "AllergyIntolerance" => settings.AllergyIntoleranceEndpoint,
                    "Immunization" => settings.ImmunizationEndpoint,
                    _ => null
                };

                if (!string.IsNullOrWhiteSpace(endpointUrl))
                {
                    validationTasks.Add(_fhirValidationService.ValidateEndpointAsync(endpointUrl, endpointType));
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
            DataRequestEndpoint = settings.DataRequestEndpoint,
            PatientEndpoint = settings.PatientEndpoint,
            ObservationEndpoint = settings.ObservationEndpoint,
            ConditionEndpoint = settings.ConditionEndpoint,
            MedicationEndpoint = settings.MedicationEndpoint,
            DiagnosticReportEndpoint = settings.DiagnosticReportEndpoint,
            ProcedureEndpoint = settings.ProcedureEndpoint,
            EncounterEndpoint = settings.EncounterEndpoint,
            AllergyIntoleranceEndpoint = settings.AllergyIntoleranceEndpoint,
            ImmunizationEndpoint = settings.ImmunizationEndpoint,
            ApiKey = settings.ApiKey,
            AuthToken = settings.AuthToken,
            CreatedAt = settings.CreatedAt,
            UpdatedAt = settings.UpdatedAt,
            IsActive = settings.IsActive,
            IsDataRequestEndpointValid = settings.IsDataRequestEndpointValid,
            IsPatientEndpointValid = settings.IsPatientEndpointValid,
            IsObservationEndpointValid = settings.IsObservationEndpointValid,
            IsConditionEndpointValid = settings.IsConditionEndpointValid,
            IsMedicationEndpointValid = settings.IsMedicationEndpointValid,
            IsDiagnosticReportEndpointValid = settings.IsDiagnosticReportEndpointValid,
            IsProcedureEndpointValid = settings.IsProcedureEndpointValid,
            IsEncounterEndpointValid = settings.IsEncounterEndpointValid,
            IsAllergyIntoleranceEndpointValid = settings.IsAllergyIntoleranceEndpointValid,
            IsImmunizationEndpointValid = settings.IsImmunizationEndpointValid,
            LastValidationDate = settings.LastValidationDate,
            LastValidationError = settings.LastValidationError
        };
    }
}
