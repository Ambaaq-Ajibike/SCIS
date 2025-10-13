using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.DTOs;

public class HospitalSettingsDto
{
    public string Id { get; set; } = string.Empty;
    public string HospitalId { get; set; } = string.Empty;
    public string HospitalName { get; set; } = string.Empty;
    
    public string? DataRequestEndpoint { get; set; }
    public string? PatientEndpoint { get; set; }
    public string? ObservationEndpoint { get; set; }
    public string? ConditionEndpoint { get; set; }
    public string? MedicationEndpoint { get; set; }
    public string? DiagnosticReportEndpoint { get; set; }
    public string? ProcedureEndpoint { get; set; }
    public string? EncounterEndpoint { get; set; }
    public string? AllergyIntoleranceEndpoint { get; set; }
    public string? ImmunizationEndpoint { get; set; }
    
    public string? ApiKey { get; set; }
    public string? AuthToken { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsActive { get; set; }
    
    // Validation status
    public bool IsDataRequestEndpointValid { get; set; }
    public bool IsPatientEndpointValid { get; set; }
    public bool IsObservationEndpointValid { get; set; }
    public bool IsConditionEndpointValid { get; set; }
    public bool IsMedicationEndpointValid { get; set; }
    public bool IsDiagnosticReportEndpointValid { get; set; }
    public bool IsProcedureEndpointValid { get; set; }
    public bool IsEncounterEndpointValid { get; set; }
    public bool IsAllergyIntoleranceEndpointValid { get; set; }
    public bool IsImmunizationEndpointValid { get; set; }
    
    public DateTime? LastValidationDate { get; set; }
    public string? LastValidationError { get; set; }
}

public class CreateHospitalSettingsDto
{
    [Required]
    public string HospitalId { get; set; } = string.Empty;
    
    [Url]
    public string? DataRequestEndpoint { get; set; }
    
    [Url]
    public string? PatientEndpoint { get; set; }
    
    [Url]
    public string? ObservationEndpoint { get; set; }
    
    [Url]
    public string? ConditionEndpoint { get; set; }
    
    [Url]
    public string? MedicationEndpoint { get; set; }
    
    [Url]
    public string? DiagnosticReportEndpoint { get; set; }
    
    [Url]
    public string? ProcedureEndpoint { get; set; }
    
    [Url]
    public string? EncounterEndpoint { get; set; }
    
    [Url]
    public string? AllergyIntoleranceEndpoint { get; set; }
    
    [Url]
    public string? ImmunizationEndpoint { get; set; }
    
    public string? ApiKey { get; set; }
    public string? AuthToken { get; set; }
}

public class UpdateHospitalSettingsDto
{
    [Url]
    public string? DataRequestEndpoint { get; set; }
    
    [Url]
    public string? PatientEndpoint { get; set; }
    
    [Url]
    public string? ObservationEndpoint { get; set; }
    
    [Url]
    public string? ConditionEndpoint { get; set; }
    
    [Url]
    public string? MedicationEndpoint { get; set; }
    
    [Url]
    public string? DiagnosticReportEndpoint { get; set; }
    
    [Url]
    public string? ProcedureEndpoint { get; set; }
    
    [Url]
    public string? EncounterEndpoint { get; set; }
    
    [Url]
    public string? AllergyIntoleranceEndpoint { get; set; }
    
    [Url]
    public string? ImmunizationEndpoint { get; set; }
    
    public string? ApiKey { get; set; }
    public string? AuthToken { get; set; }
}

public class EndpointValidationDto
{
    public string EndpointUrl { get; set; } = string.Empty;
    public string EndpointType { get; set; } = string.Empty;
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ResponseSample { get; set; }
    public int ResponseTimeMs { get; set; }
    public DateTime ValidatedAt { get; set; } = DateTime.UtcNow;
}
