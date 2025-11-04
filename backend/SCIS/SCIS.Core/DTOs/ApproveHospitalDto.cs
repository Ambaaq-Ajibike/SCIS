using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.DTOs;

public class ApproveHospitalDto
{
    [Required]
    public Guid HospitalId { get; set; }
    
    [Required]
    public bool IsApproved { get; set; }
    
    [MaxLength(1000)]
    public string? ApprovalNotes { get; set; }
}

