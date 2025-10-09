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

public class PatientAuthService(SCISDbContext _context, IConfiguration _configuration) : IPatientAuthService
{
    public async Task<PatientLoginResponse?> LoginAsync(PatientLoginRequest request)
    {
        var patient = await _context.Patients
            .Include(p => p.Hospital)
            .FirstOrDefaultAsync(p => p.PatientId == request.PatientId && p.IsActive);

        if (patient == null || !BCrypt.Net.BCrypt.Verify(request.Password, patient.PasswordHash))
            return null;

        var token = await GenerateTokenAsync(patient.Id, patient.HospitalId);

        // Log the login
        //await LogAuditAsync("PatientLogin", patient.Id, patient.HospitalId, "Patient", patient.Id, "Patient login successful");

        return new PatientLoginResponse
        {
            Token = token,
            RefreshToken = Guid.NewGuid().ToString(),
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            Patient = new PatientDto
            {
                Id = patient.Id.ToString(),
                FirstName = patient.FirstName,
                LastName = patient.LastName,
                PatientId = patient.PatientId,
                DateOfBirth = patient.DateOfBirth,
                Gender = patient.Gender,
                PhoneNumber = patient.PhoneNumber,
                Email = patient.Email,
                HospitalId = patient.HospitalId.ToString(),
                HospitalName = patient.Hospital?.Name ?? "Unknown Hospital",
                IsActive = patient.IsActive,
                BiometricConsent = patient.BiometricConsent,
                BiometricConsentDate = patient.BiometricConsentDate,
                CreatedAt = patient.CreatedAt
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

    public async Task<string> GenerateTokenAsync(Guid patientId, Guid hospitalId)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured"));
        
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, patientId.ToString()),
            new(ClaimTypes.Role, "Patient"),
            new("hospitalId", hospitalId.ToString()),
            new("userType", "Patient")
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

    public async Task LogoutAsync(string token)
    {
        // In a real implementation, you might want to blacklist the token
        // For now, we'll just log the logout
        await LogAuditAsync("PatientLogout", null, null, "Token", null, "Patient logged out");
    }

    private async Task LogAuditAsync(string action, Guid? patientId, Guid? hospitalId, string entityType, Guid? entityId, string details)
    {
        var auditLog = new AuditLog
        {
            Action = action,
            UserId = patientId, // Using patientId as UserId for audit purposes
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
