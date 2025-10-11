using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.DTOs;

public class CompletePatientSignupDto
{
    [Required]
    [MaxLength(20)]
    public string PatientId { get; set; } = string.Empty;
    
    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;
    
    [Required]
    [Compare("Password")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
