using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.DTOs;

public class DataRequestDto
{
    [Required]
    [MaxLength(50)]
    public string PatientId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string DataType { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Purpose { get; set; }
}

public class DataRequestResponseDto
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ResponseData { get; set; }
    public string? DenialReason { get; set; }
    public DateTime RequestDate { get; set; }
    public DateTime? ResponseDate { get; set; }
    public DateTime? ApprovalDate { get; set; }
    public int ResponseTimeMs { get; set; }
    public bool IsConsentValid { get; set; }
    public bool IsRoleAuthorized { get; set; }
    public bool IsCrossHospitalRequest { get; set; }
    
    // Additional fields for bidirectional requests
    public string? RequestingHospitalName { get; set; }
    public string? PatientHospitalName { get; set; }
    public string? PatientName { get; set; }
    public string? PatientId { get; set; }
    public string? ApprovingUserName { get; set; }
}

public class DataRequestApprovalDto
{
    [Required]
    public Guid RequestId { get; set; }
    
    [Required]
    public bool IsApproved { get; set; }
    
    [MaxLength(1000)]
    public string? Reason { get; set; }
}

public class PendingDataRequestDto
{
    public Guid Id { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientId { get; set; } = string.Empty;
    public string RequestingHospitalName { get; set; } = string.Empty;
    public string DataType { get; set; } = string.Empty;
    public string? Purpose { get; set; }
    public DateTime RequestDate { get; set; }
    public string RequestingUserName { get; set; } = string.Empty;
}
