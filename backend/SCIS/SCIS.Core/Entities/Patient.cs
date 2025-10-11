using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.Entities;

public class Patient
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
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
    
    [Required]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    public string? PasswordHash { get; set; } = default;
    
    public Guid HospitalId { get; set; }
    public Hospital Hospital { get; set; } = null!;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    public bool IsSignupCompleted { get; set; } = false;
    
    // Navigation properties
    public ICollection<PatientConsent> PatientConsents { get; set; } = [];
    public ICollection<PatientFeedback> PatientFeedbacks { get; set; } = [];
}
