using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.DTOs;

public class RegisterHospitalDto
{
    [Required]
    [MaxLength(200)]
    public string HospitalName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string Address { get; set; } = string.Empty;
    
    [MaxLength(20)]
    public string? PhoneNumber { get; set; }
    
    [MaxLength(50)]
    public string? LicenseNumber { get; set; }
    
    // Hospital Manager Account Details
    [Required]
    [MaxLength(100)]
    public string ManagerUsername { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string ManagerEmail { get; set; } = string.Empty;
    
    [Required]
    [MinLength(6)]
    public string ManagerPassword { get; set; } = string.Empty;
    
    // Verification Details
    [MaxLength(500)]
    public string? VerificationDocuments { get; set; } // JSON string or comma-separated document references
    
    [MaxLength(1000)]
    public string? VerificationNotes { get; set; } // Additional notes for verification
}

