using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.Entities;

public class Hospital
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;
    
    [MaxLength(20)]
    public string? PhoneNumber { get; set; }
    
    [MaxLength(100)]
    public string? Email { get; set; }
    
    [MaxLength(50)]
    public string? LicenseNumber { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = false; // Default to false, requires approval
    
    // Verification and approval fields
    public bool IsApproved { get; set; } = false;
    public DateTime? ApprovedAt { get; set; }
    public Guid? ApprovedByUserId { get; set; }
    
    // Verification details
    [MaxLength(500)]
    public string? VerificationDocuments { get; set; } // JSON string or comma-separated document references
    
    [MaxLength(1000)]
    public string? VerificationNotes { get; set; } // Additional notes for verification
    
    // Performance metrics
    public double AverageTES { get; set; } = 0.0;
    public double InteroperabilitySuccessRate { get; set; } = 0.0;
    public int PatientVolume { get; set; } = 0;
    public double PerformanceIndex { get; set; } = 0.0;
    
    // Navigation properties
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Patient> Patients { get; set; } = new List<Patient>();
    public ICollection<DataRequest> DataRequests { get; set; } = new List<DataRequest>();
    public ICollection<PatientFeedback> PatientFeedbacks { get; set; } = new List<PatientFeedback>();
    public HospitalSettings? Settings { get; set; }
    public ICollection<DataRequestEndpoint> DataRequestEndpoints { get; set; } = new List<DataRequestEndpoint>();
}
