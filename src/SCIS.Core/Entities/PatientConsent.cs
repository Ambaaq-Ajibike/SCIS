using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.Entities;

public class PatientConsent
{
    public int Id { get; set; }
    
    public int PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    
    public int RequestingUserId { get; set; }
    public User RequestingUser { get; set; } = null!;
    
    public int RequestingHospitalId { get; set; }
    public Hospital RequestingHospital { get; set; } = null!;
    
    [Required]
    [MaxLength(50)]
    public string DataType { get; set; } = string.Empty; // e.g., "LabResults", "MedicalHistory"
    
    [MaxLength(1000)]
    public string? Purpose { get; set; }
    
    public bool IsConsented { get; set; } = false;
    public DateTime ConsentDate { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiryDate { get; set; }
    
    [MaxLength(1000)]
    public string? Notes { get; set; }
    
    public bool IsActive { get; set; } = true;
}
