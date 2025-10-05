using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using SCIS.Core.DTOs;
using SCIS.Core.Entities;
using SCIS.Core.Interfaces;
using SCIS.Infrastructure.Data;
using Microsoft.Extensions.Configuration;

namespace SCIS.Infrastructure.Services;

public class AuthService(SCISDbContext _context, IConfiguration _configuration) : IAuthService
{

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.Hospital)
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        var token = await GenerateTokenAsync(user.Id, user.Role, user.HospitalId);
        var refreshToken = Guid.NewGuid().ToString();

        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Log the login
        await LogAuditAsync("Login", user.Id, user.HospitalId, "User", user.Id, "Successful login");

        return new LoginResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                HospitalId = user.HospitalId,
                HospitalName = user.Hospital?.Name
            }
        };
    }

    public async Task<bool> ValidateTokenAsync(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured"));
            
            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidIssuer = _configuration["Jwt:Issuer"],
                ValidAudience = _configuration["Jwt:Audience"],
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<string> GenerateTokenAsync(Guid userId, string role, Guid? hospitalId)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured"));
        
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Role, role),
            new("hospitalId", hospitalId?.ToString() ?? "")
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(60),
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public async Task<bool> HasPermissionAsync(Guid userId, string permission)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        // Simple role-based permissions
        return user.Role switch
        {
            "HospitalManager" => true,
            "Doctor" => permission is "ViewPatientData" or "RequestData" or "SubmitFeedback",
            "Staff" => permission is "ViewPatientData" or "RequestData",
            _ => false
        };
    }

    public async Task LogoutAsync(string token)
    {
        // In a real implementation, you might want to blacklist the token
        // For now, we'll just log the logout
        await LogAuditAsync("Logout", null, null, "Token", null, "User logged out");
    }

    private async Task LogAuditAsync(string action, Guid? userId, Guid? hospitalId, string entityType, Guid? entityId, string details)
    {
        var auditLog = new AuditLog
        {
            Action = action,
            UserId = userId,
            HospitalId = hospitalId,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            Status = "Success",
            Timestamp = DateTime.UtcNow
        };

        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();
    }
}
