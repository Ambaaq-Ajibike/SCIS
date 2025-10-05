using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Role { get; set; } = string.Empty;
    
    public Guid? HospitalId { get; set; }
    public Hospital? Hospital { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public ICollection<PatientConsent> PatientConsents { get; set; } = new List<PatientConsent>();
    public ICollection<DataRequest> DataRequests { get; set; } = new List<DataRequest>();
    public ICollection<PatientFeedback> PatientFeedbacks { get; set; } = new List<PatientFeedback>();
}
