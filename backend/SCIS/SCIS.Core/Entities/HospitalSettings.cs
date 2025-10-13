using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.Entities;

public class HospitalSettings
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid HospitalId { get; set; }
    public Hospital Hospital { get; set; } = null!;
    
    [MaxLength(500)]
    public string? DataRequestEndpoint { get; set; }
    
    [MaxLength(500)]
    public string? PatientEndpoint { get; set; }
    
    [MaxLength(500)]
    public string? ObservationEndpoint { get; set; }
    
    [MaxLength(500)]
    public string? ConditionEndpoint { get; set; }
    
    [MaxLength(500)]
    public string? MedicationEndpoint { get; set; }
    
    [MaxLength(500)]
    public string? DiagnosticReportEndpoint { get; set; }
    
    [MaxLength(500)]
    public string? ProcedureEndpoint { get; set; }
    
    [MaxLength(500)]
    public string? EncounterEndpoint { get; set; }
    
    [MaxLength(500)]
    public string? AllergyIntoleranceEndpoint { get; set; }
    
    [MaxLength(500)]
    public string? ImmunizationEndpoint { get; set; }
    
    [MaxLength(100)]
    public string? ApiKey { get; set; }
    
    [MaxLength(100)]
    public string? AuthToken { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    
    // Validation status for each endpoint
    public bool IsDataRequestEndpointValid { get; set; } = false;
    public bool IsPatientEndpointValid { get; set; } = false;
    public bool IsObservationEndpointValid { get; set; } = false;
    public bool IsConditionEndpointValid { get; set; } = false;
    public bool IsMedicationEndpointValid { get; set; } = false;
    public bool IsDiagnosticReportEndpointValid { get; set; } = false;
    public bool IsProcedureEndpointValid { get; set; } = false;
    public bool IsEncounterEndpointValid { get; set; } = false;
    public bool IsAllergyIntoleranceEndpointValid { get; set; } = false;
    public bool IsImmunizationEndpointValid { get; set; } = false;
    
    public DateTime? LastValidationDate { get; set; }
    public string? LastValidationError { get; set; }
}
