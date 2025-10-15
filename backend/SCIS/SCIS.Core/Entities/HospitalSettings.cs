using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.Entities;

public class HospitalSettings
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid HospitalId { get; set; }
    public Hospital Hospital { get; set; } = null!;
    
    [MaxLength(500)]
    public string? PatientEverythingEndpoint { get; set; }
    
    [MaxLength(100)]
    public string? ApiKey { get; set; }
    
    [MaxLength(100)]
    public string? AuthToken { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    
    // Validation status for the endpoint
    public bool IsPatientEverythingEndpointValid { get; set; } = false;
    
    public DateTime? LastValidationDate { get; set; }
    public string? LastValidationError { get; set; }
    
    // Parameter configuration for the endpoint
    public string? PatientEverythingEndpointParameters { get; set; }
}
