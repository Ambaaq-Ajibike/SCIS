using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.DTOs;

public class CreateDoctorDto
{
    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? Specialty { get; set; }
    
    // Hospital ID will be obtained from the authenticated user's context
}

