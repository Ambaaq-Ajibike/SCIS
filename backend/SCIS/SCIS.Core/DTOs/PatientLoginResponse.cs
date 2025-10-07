namespace SCIS.Core.DTOs;

public class PatientLoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public PatientDto Patient { get; set; } = null!;
}
