namespace SCIS.Core.DTOs;

public class DoctorDto
{
    public string Id { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public string HospitalId { get; set; } = string.Empty;
    public string HospitalName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
