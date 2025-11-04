using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SCIS.Core.DTOs;
using SCIS.Core.Entities;
using SCIS.Core.Interfaces;
using SCIS.Infrastructure.Data;

namespace SCIS.Infrastructure.Services;

public class OnboardingService : IOnboardingService
{
    private readonly SCISDbContext _context;
    private readonly IAuthService _authService;
    private readonly ILogger<OnboardingService> _logger;

    public OnboardingService(
        SCISDbContext context,
        IAuthService authService,
        ILogger<OnboardingService> logger)
    {
        _context = context;
        _authService = authService;
        _logger = logger;
    }

    public async Task<LoginResponse> RegisterHospitalAsync(RegisterHospitalDto dto)
    {
        try
        {
            // Check if email already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.ManagerEmail);
            
            if (existingUser != null)
            {
                throw new InvalidOperationException("A user with this email already exists");
            }

            // Check if hospital name already exists
            var existingHospital = await _context.Hospitals
                .FirstOrDefaultAsync(h => h.Name == dto.HospitalName);
            
            if (existingHospital != null)
            {
                throw new InvalidOperationException("A hospital with this name already exists");
            }

            // Create hospital (not approved yet)
            var hospital = new Hospital
            {
                Name = dto.HospitalName,
                Address = dto.Address,
                PhoneNumber = dto.PhoneNumber,
                Email = dto.Email,
                LicenseNumber = dto.LicenseNumber,
                IsActive = false,
                IsApproved = false,
                ContactPersonName = dto.ContactPersonName,
                ContactPersonEmail = dto.ContactPersonEmail,
                ContactPersonPhone = dto.ContactPersonPhone,
                VerificationDocuments = dto.VerificationDocuments,
                VerificationNotes = dto.VerificationNotes,
                CreatedAt = DateTime.UtcNow
            };

            _context.Hospitals.Add(hospital);
            await _context.SaveChangesAsync();

            // Create hospital manager user
            var manager = new User
            {
                Username = dto.ManagerUsername,
                Email = dto.ManagerEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.ManagerPassword),
                Role = "HospitalManager",
                HospitalId = hospital.Id,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(manager);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Hospital registered: {HospitalName} (ID: {HospitalId})", hospital.Name, hospital.Id);

            // Auto-login the manager
            var token = await _authService.GenerateTokenAsync(manager.Id, manager.Role, manager.HospitalId);
            var refreshToken = Guid.NewGuid().ToString();

            return new LoginResponse
            {
                Token = token,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(60),
                User = new UserDto
                {
                    Id = manager.Id,
                    Username = manager.Username,
                    Email = manager.Email,
                    Role = manager.Role,
                    HospitalId = manager.HospitalId,
                    HospitalName = hospital.Name
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering hospital");
            throw;
        }
    }

    public async Task<DoctorDto> CreateDoctorAsync(CreateDoctorDto dto, Guid hospitalId)
    {
        try
        {
            // Verify hospital exists and is approved
            var hospital = await _context.Hospitals.FindAsync(hospitalId);
            if (hospital == null)
            {
                throw new ArgumentException("Hospital not found");
            }

            if (!hospital.IsApproved || !hospital.IsActive)
            {
                throw new InvalidOperationException("Hospital must be approved before adding doctors");
            }

            // Check if email already exists
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email);
            
            if (existingUser != null)
            {
                throw new InvalidOperationException("A user with this email already exists");
            }

            // Create doctor user
            var doctor = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = "Doctor",
                HospitalId = hospitalId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(doctor);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Doctor created: {DoctorName} for hospital {HospitalName}", doctor.Username, hospital.Name);

            return new DoctorDto
            {
                Id = doctor.Id.ToString(),
                FirstName = doctor.Username,
                LastName = "",
                Specialty = dto.Specialty ?? "General Medicine",
                HospitalId = hospitalId.ToString(),
                HospitalName = hospital.Name,
                IsActive = doctor.IsActive
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating doctor");
            throw;
        }
    }

    public async Task<bool> ApproveHospitalAsync(Guid hospitalId, bool isApproved, Guid approvedByUserId, string? notes = null)
    {
        try
        {
            var hospital = await _context.Hospitals.FindAsync(hospitalId);
            if (hospital == null)
            {
                throw new ArgumentException("Hospital not found");
            }

            hospital.IsApproved = isApproved;
            hospital.IsActive = isApproved; // Activate when approved
            hospital.ApprovedAt = isApproved ? DateTime.UtcNow : null;
            hospital.ApprovedByUserId = isApproved ? approvedByUserId : null;
            
            if (!string.IsNullOrEmpty(notes))
            {
                hospital.VerificationNotes = notes;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Hospital {HospitalId} approval status changed to {IsApproved} by {UserId}", 
                hospitalId, isApproved, approvedByUserId);

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving hospital");
            throw;
        }
    }

    public async Task<List<HospitalDto>> GetPendingHospitalsAsync()
    {
        try
        {
            var hospitals = await _context.Hospitals
                .Where(h => !h.IsApproved)
                .OrderByDescending(h => h.CreatedAt)
                .ToListAsync();

            return hospitals.Select(h => new HospitalDto
            {
                Id = h.Id.ToString(),
                Name = h.Name,
                Address = h.Address,
                PhoneNumber = h.PhoneNumber ?? "",
                Email = h.Email ?? "",
                LicenseNumber = h.LicenseNumber,
                IsActive = h.IsActive,
                IsApproved = h.IsApproved,
                CreatedAt = h.CreatedAt,
                ApprovedAt = h.ApprovedAt,
                ContactPersonName = h.ContactPersonName,
                ContactPersonEmail = h.ContactPersonEmail,
                ContactPersonPhone = h.ContactPersonPhone,
                VerificationDocuments = h.VerificationDocuments,
                VerificationNotes = h.VerificationNotes
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pending hospitals");
            throw;
        }
    }

    public async Task<HospitalDto?> GetHospitalByIdAsync(Guid hospitalId)
    {
        try
        {
            var hospital = await _context.Hospitals.FindAsync(hospitalId);
            if (hospital == null)
                return null;

            return new HospitalDto
            {
                Id = hospital.Id.ToString(),
                Name = hospital.Name,
                Address = hospital.Address,
                PhoneNumber = hospital.PhoneNumber ?? "",
                Email = hospital.Email ?? "",
                LicenseNumber = hospital.LicenseNumber,
                IsActive = hospital.IsActive,
                IsApproved = hospital.IsApproved,
                CreatedAt = hospital.CreatedAt,
                ApprovedAt = hospital.ApprovedAt,
                ContactPersonName = hospital.ContactPersonName,
                ContactPersonEmail = hospital.ContactPersonEmail,
                ContactPersonPhone = hospital.ContactPersonPhone,
                VerificationDocuments = hospital.VerificationDocuments,
                VerificationNotes = hospital.VerificationNotes
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting hospital by ID");
            throw;
        }
    }
}

