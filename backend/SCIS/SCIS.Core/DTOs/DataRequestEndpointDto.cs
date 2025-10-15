using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.DTOs;

public class DataRequestEndpointDto
{
    public Guid Id { get; set; }
    
    [Required]
    public Guid HospitalId { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string DataType { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string DataTypeDisplayName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string EndpointUrl { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string FhirResourceType { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? ApiKey { get; set; }
    
    [MaxLength(100)]
    public string? AuthToken { get; set; }
    
    [MaxLength(50)]
    public string HttpMethod { get; set; } = "GET";
    
    [MaxLength(1000)]
    public string? Description { get; set; }
    
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Validation status
    public bool IsEndpointValid { get; set; } = false;
    public DateTime? LastValidationDate { get; set; }
    public string? LastValidationError { get; set; }
    
    // Parameter configuration for the endpoint
    public string? EndpointParameters { get; set; }
    
    // Role-based access control
    public string? AllowedRoles { get; set; }
    
    // Additional fields for display
    public string? HospitalName { get; set; }
}

public class CreateDataRequestEndpointDto
{
    [Required]
    public Guid HospitalId { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string DataType { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string DataTypeDisplayName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string EndpointUrl { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string FhirResourceType { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? ApiKey { get; set; }
    
    [MaxLength(100)]
    public string? AuthToken { get; set; }
    
    [MaxLength(50)]
    public string HttpMethod { get; set; } = "GET";
    
    [MaxLength(1000)]
    public string? Description { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    // Parameter configuration for the endpoint
    public string? EndpointParameters { get; set; }
    
    // Role-based access control
    public string? AllowedRoles { get; set; }
}

public class UpdateDataRequestEndpointDto
{
    [Required]
    [MaxLength(200)]
    public string DataTypeDisplayName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string EndpointUrl { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string FhirResourceType { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? ApiKey { get; set; }
    
    [MaxLength(100)]
    public string? AuthToken { get; set; }
    
    [MaxLength(50)]
    public string HttpMethod { get; set; } = "GET";
    
    [MaxLength(1000)]
    public string? Description { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    // Parameter configuration for the endpoint
    public string? EndpointParameters { get; set; }
    
    // Role-based access control
    public string? AllowedRoles { get; set; }
}
