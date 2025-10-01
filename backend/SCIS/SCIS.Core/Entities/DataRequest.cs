using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.Entities;

public class DataRequest
{
    public int Id { get; set; }
    
    public int RequestingUserId { get; set; }
    public User RequestingUser { get; set; } = null!;
    
    public int RequestingHospitalId { get; set; }
    public Hospital RequestingHospital { get; set; } = null!;
    
    public int PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    
    [Required]
    [MaxLength(50)]
    public string DataType { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Purpose { get; set; }
    
    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // Pending, Approved, Denied, Completed
    
    public DateTime RequestDate { get; set; } = DateTime.UtcNow;
    public DateTime? ResponseDate { get; set; }
    
    [MaxLength(1000)]
    public string? ResponseData { get; set; } // FHIR JSON response
    
    [MaxLength(1000)]
    public string? DenialReason { get; set; }
    
    public int ResponseTimeMs { get; set; } = 0;
    public bool IsConsentValid { get; set; } = false;
    public bool IsRoleAuthorized { get; set; } = false;
    
    // Navigation properties
    public PatientConsent? PatientConsent { get; set; }
}
