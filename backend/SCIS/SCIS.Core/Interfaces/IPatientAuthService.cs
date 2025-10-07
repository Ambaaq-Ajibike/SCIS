using SCIS.Core.DTOs;

namespace SCIS.Core.Interfaces;

public interface IPatientAuthService
{
    Task<PatientLoginResponse?> LoginAsync(PatientLoginRequest request);
    Task<bool> ValidateTokenAsync(string token);
    Task<string> GenerateTokenAsync(Guid patientId, Guid hospitalId);
    Task LogoutAsync(string token);
}
