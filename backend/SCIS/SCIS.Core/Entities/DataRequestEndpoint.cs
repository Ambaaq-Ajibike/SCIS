using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.Entities;

public class DataRequestEndpoint
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid HospitalId { get; set; }
    public Hospital Hospital { get; set; } = null!;
    
    [Required]
    [MaxLength(50)]
    public string DataType { get; set; } = string.Empty; // LabResults, MedicalHistory, TreatmentRecords, etc.
    
    [Required]
    [MaxLength(200)]
    public string DataTypeDisplayName { get; set; } = string.Empty; // "Lab Results", "Medical History", etc.
    
    [Required]
    [MaxLength(500)]
    public string EndpointUrl { get; set; } = string.Empty; // The FHIR endpoint URL
    
    [Required]
    [MaxLength(50)]
    public string FhirResourceType { get; set; } = string.Empty; // Patient, Observation, Condition, etc.
    
    [MaxLength(100)]
    public string? ApiKey { get; set; }
    
    [MaxLength(100)]
    public string? AuthToken { get; set; }
    
    [MaxLength(50)]
    public string HttpMethod { get; set; } = "GET";
    
    [MaxLength(1000)]
    public string? Description { get; set; }
    
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Validation status
    public bool IsEndpointValid { get; set; } = false;
    public DateTime? LastValidationDate { get; set; }
    public string? LastValidationError { get; set; }
    
    // Parameter configuration for the endpoint
    public string? EndpointParameters { get; set; } // JSON string of parameters
    
    // Role-based access control
    public string? AllowedRoles { get; set; } // JSON array of roles that can access this endpoint
}
