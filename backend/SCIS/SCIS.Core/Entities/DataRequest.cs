using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.Entities;

public class DataRequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid RequestingUserId { get; set; }
    public User RequestingUser { get; set; } = null!;
    
    public Guid RequestingHospitalId { get; set; }
    public Hospital RequestingHospital { get; set; } = null!;
    
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    
    // New fields for bidirectional requests
    public Guid? PatientHospitalId { get; set; }
    public Hospital? PatientHospital { get; set; }
    
    public Guid? ApprovingUserId { get; set; }
    public User? ApprovingUser { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string DataType { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Purpose { get; set; }
    
    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Denied, Completed
    
    public DateTime RequestDate { get; set; } = DateTime.UtcNow;
    public DateTime? ResponseDate { get; set; }
    public DateTime? ApprovalDate { get; set; }
    
    [MaxLength(1000)]
    public string? ResponseData { get; set; } // FHIR JSON response
    
    [MaxLength(1000)]
    public string? DenialReason { get; set; }
    
    public int ResponseTimeMs { get; set; } = 0;
    public bool IsConsentValid { get; set; } = false;
    public bool IsRoleAuthorized { get; set; } = false;
    public bool IsCrossHospitalRequest { get; set; } = false;
    
    // Navigation properties
    public PatientConsent? PatientConsent { get; set; }
}
