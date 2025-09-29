using SCIS.Core.DTOs;

namespace SCIS.Core.Interfaces;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    Task<bool> ValidateTokenAsync(string token);
    Task<string> GenerateTokenAsync(int userId, string role, int? hospitalId);
    Task<bool> HasPermissionAsync(int userId, string permission);
    Task LogoutAsync(string token);
}
