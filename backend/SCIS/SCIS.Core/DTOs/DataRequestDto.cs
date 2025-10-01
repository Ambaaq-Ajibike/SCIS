using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.DTOs;

public class DataRequestDto
{
    [Required]
    public int PatientId { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string DataType { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Purpose { get; set; }
}

public class DataRequestResponseDto
{
    public int Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ResponseData { get; set; }
    public string? DenialReason { get; set; }
    public DateTime RequestDate { get; set; }
    public DateTime? ResponseDate { get; set; }
    public int ResponseTimeMs { get; set; }
    public bool IsConsentValid { get; set; }
    public bool IsRoleAuthorized { get; set; }
}
