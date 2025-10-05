using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.Entities;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(50)]
    public string Action { get; set; } = string.Empty; // Login, DataRequest, ConsentGranted, etc.
    
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    
    public Guid? HospitalId { get; set; }
    public Hospital? Hospital { get; set; }
    
    [MaxLength(100)]
    public string? EntityType { get; set; } // User, Patient, DataRequest, etc.
    
    public Guid? EntityId { get; set; }
    
    [MaxLength(1000)]
    public string? Details { get; set; }
    
    [MaxLength(50)]
    public string Status { get; set; } = "Success"; // Success, Failed, Error
    
    [MaxLength(1000)]
    public string? ErrorMessage { get; set; }
    
    public int ResponseTimeMs { get; set; } = 0;
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    [MaxLength(50)]
    public string? IpAddress { get; set; }
    
    [MaxLength(500)]
    public string? UserAgent { get; set; }
}
