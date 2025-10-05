using SCIS.Core.DTOs;

namespace SCIS.Core.Interfaces;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    Task<bool> ValidateTokenAsync(string token);
    Task<string> GenerateTokenAsync(Guid userId, string role, Guid? hospitalId);
    Task<bool> HasPermissionAsync(Guid userId, string permission);
    Task LogoutAsync(string token);
}
