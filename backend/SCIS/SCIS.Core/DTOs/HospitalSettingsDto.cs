using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.DTOs;

public class HospitalSettingsDto
{
    public string Id { get; set; } = string.Empty;
    public string HospitalId { get; set; } = string.Empty;
    public string HospitalName { get; set; } = string.Empty;
    
    public string? PatientEverythingEndpoint { get; set; }
    
    public string? ApiKey { get; set; }
    public string? AuthToken { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsActive { get; set; }
    
    // Validation status
    public bool IsPatientEverythingEndpointValid { get; set; }
    
    public DateTime? LastValidationDate { get; set; }
    public string? LastValidationError { get; set; }
    
    // Parameter configuration for the endpoint
    public string? PatientEverythingEndpointParameters { get; set; }
}

public class CreateHospitalSettingsDto
{
    [Required]
    public string HospitalId { get; set; } = string.Empty;
    
    [Url]
    public string? PatientEverythingEndpoint { get; set; }
    
    public string? ApiKey { get; set; }
    public string? AuthToken { get; set; }
    
    // Parameter configuration for the endpoint
    public string? PatientEverythingEndpointParameters { get; set; }
}

public class UpdateHospitalSettingsDto
{
    [Url]
    public string? PatientEverythingEndpoint { get; set; }
    
    public string? ApiKey { get; set; }
    public string? AuthToken { get; set; }
    
    // Parameter configuration for the endpoint
    public string? PatientEverythingEndpointParameters { get; set; }
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

public class EndpointParameterDto
{
    public string name { get; set; } = string.Empty;
    public string type { get; set; } = "string"; // Only string type for path parameters
    public bool required { get; set; } = true; // Path parameters are always required
    public string? description { get; set; }
    public string? example { get; set; }
    public string templatePlaceholder { get; set; } = string.Empty; // For path parameters: "{patientId}", "{id}", etc.
}
