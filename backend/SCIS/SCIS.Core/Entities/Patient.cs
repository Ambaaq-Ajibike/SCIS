using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.Entities;

public class Patient
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(20)]
    public string PatientId { get; set; } = string.Empty;
    
    public DateTime DateOfBirth { get; set; }
    
    [MaxLength(10)]
    public string Gender { get; set; } = string.Empty;
    
    [MaxLength(20)]
    public string? PhoneNumber { get; set; }
    
    [MaxLength(100)]
    public string? Email { get; set; }
    
    public int HospitalId { get; set; }
    public Hospital Hospital { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    
    // Biometric consent
    public bool BiometricConsent { get; set; } = false;
    public DateTime? BiometricConsentDate { get; set; }
    
    // Navigation properties
    public ICollection<PatientConsent> PatientConsents { get; set; } = new List<PatientConsent>();
    public ICollection<PatientFeedback> PatientFeedbacks { get; set; } = new List<PatientFeedback>();
}
