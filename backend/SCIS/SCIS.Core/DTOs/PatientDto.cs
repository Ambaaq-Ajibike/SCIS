namespace SCIS.Core.DTOs;

public class PatientDto
{
    public string Id { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PatientId { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string HospitalId { get; set; } = string.Empty;
    public string HospitalName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool BiometricConsent { get; set; }
    public DateTime? BiometricConsentDate { get; set; }
    public DateTime CreatedAt { get; set; }
}
