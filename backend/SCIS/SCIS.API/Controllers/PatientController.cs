using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SCIS.Core.DTOs;
using SCIS.Core.Entities;
using SCIS.Core.Interfaces;
using SCIS.Infrastructure.Data;
using System.Security.Claims;

namespace SCIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PatientController : ControllerBase
{
    private readonly SCISDbContext _context;
    private readonly IEmailService _emailService;

    public PatientController(SCISDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PatientDto>>> GetPatients([FromQuery] string? search = null)
    {
        try
        {
            var hospitalId = GetCurrentUserHospitalId();
            if (hospitalId == null)
            {
                return Forbid("Access denied. Hospital context required.");
            }

            var query = _context.Patients
                .Include(p => p.Hospital)
                .Where(p => p.HospitalId == hospitalId);

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => 
                    p.FirstName.Contains(search) || 
                    p.LastName.Contains(search) || 
                    p.PatientId.Contains(search));
            }

            var patients = await query
                .OrderBy(p => p.LastName)
                .ThenBy(p => p.FirstName)
                .ToListAsync();

            var patientDtos = patients.Select(p => new PatientDto
            {
                Id = p.Id.ToString(),
                FirstName = p.FirstName,
                LastName = p.LastName,
                PatientId = p.PatientId,
                DateOfBirth = p.DateOfBirth,
                Gender = p.Gender,
                PhoneNumber = p.PhoneNumber,
                Email = p.Email,
                HospitalId = p.HospitalId.ToString(),
                HospitalName = p.Hospital?.Name ?? "Unknown Hospital",
                IsActive = p.IsActive,
                IsSignupCompleted = p.IsSignupCompleted,
                CreatedAt = p.CreatedAt
            });

            return Ok(patientDtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching patients", error = ex.Message });
        }
    }

    [HttpGet("{patientId}")]
    public async Task<ActionResult<PatientDto>> GetPatientById(string patientId)
    {
        try
        {
            var hospitalId = GetCurrentUserHospitalId();
            if (hospitalId == null)
            {
                return Forbid("Access denied. Hospital context required.");
            }

            var patient = await _context.Patients
                .Include(p => p.Hospital)
                .FirstOrDefaultAsync(p => p.PatientId == patientId && p.HospitalId == hospitalId);

            if (patient == null)
            {
                return NotFound(new { message = "Patient not found" });
            }

            var patientDto = new PatientDto
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
                IsSignupCompleted = patient.IsSignupCompleted,
                CreatedAt = patient.CreatedAt
            };

            return Ok(patientDto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching patient", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<PatientDto>> CreatePatient([FromBody] CreatePatientDto createPatientDto)
    {
        try
        {
            var hospitalId = GetCurrentUserHospitalId();
            if (hospitalId == null)
            {
                return Forbid("Access denied. Hospital context required.");
            }

            // Check if email already exists
            var existingPatient = await _context.Patients
                .FirstOrDefaultAsync(p => p.Email == createPatientDto.Email);
            
            if (existingPatient != null)
            {
                return BadRequest(new { message = "A patient with this email already exists" });
            }

            // Generate unique patient ID
            var patientId = await GenerateUniquePatientId();

            var patient = new Patient
            {
                FirstName = createPatientDto.FirstName,
                LastName = createPatientDto.LastName,
                PatientId = patientId,
                DateOfBirth = createPatientDto.DateOfBirth,
                Gender = createPatientDto.Gender,
                PhoneNumber = createPatientDto.PhoneNumber,
                Email = createPatientDto.Email,
                HospitalId = hospitalId.Value,
                IsActive = true,
                PasswordHash = "",
                IsSignupCompleted = false
            };

            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            // Send signup email
            var hospital = await _context.Hospitals.FindAsync(hospitalId);
            var emailSent = await _emailService.SendPatientSignupEmailAsync(
                patient.Email, 
                $"{patient.FirstName} {patient.LastName}", 
                patient.PatientId, 
                hospital?.Name ?? "Hospital"
            );

            if (!emailSent)
            {
                // Log warning but don't fail the operation
                Console.WriteLine($"Warning: Failed to send signup email to {patient.Email}");
            }

            var patientDto = new PatientDto
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
                HospitalName = hospital?.Name ?? "Unknown Hospital",
                IsActive = patient.IsActive,
                IsSignupCompleted = patient.IsSignupCompleted,
                CreatedAt = patient.CreatedAt
            };

            return CreatedAtAction(nameof(GetPatientById), new { patientId = patient.PatientId }, patientDto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating patient", error = ex.Message });
        }
    }

    [HttpPut("{patientId}")]
    public async Task<ActionResult<PatientDto>> UpdatePatient(string patientId, [FromBody] UpdatePatientDto updatePatientDto)
    {
        try
        {
            var hospitalId = GetCurrentUserHospitalId();
            if (hospitalId == null)
            {
                return Forbid("Access denied. Hospital context required.");
            }

            var patient = await _context.Patients
                .Include(p => p.Hospital)
                .FirstOrDefaultAsync(p => p.PatientId == patientId && p.HospitalId == hospitalId);

            if (patient == null)
            {
                return NotFound(new { message = "Patient not found" });
            }

            // Check if email is being changed and if it already exists
            if (patient.Email != updatePatientDto.Email)
            {
                var existingPatient = await _context.Patients
                    .FirstOrDefaultAsync(p => p.Email == updatePatientDto.Email && p.Id != patient.Id);
                
                if (existingPatient != null)
                {
                    return BadRequest(new { message = "A patient with this email already exists" });
                }
            }

            patient.FirstName = updatePatientDto.FirstName;
            patient.LastName = updatePatientDto.LastName;
            patient.DateOfBirth = updatePatientDto.DateOfBirth;
            patient.Gender = updatePatientDto.Gender;
            patient.PhoneNumber = updatePatientDto.PhoneNumber;
            patient.Email = updatePatientDto.Email;
            patient.IsActive = updatePatientDto.IsActive;

            await _context.SaveChangesAsync();

            var patientDto = new PatientDto
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
                IsSignupCompleted = patient.IsSignupCompleted,
                CreatedAt = patient.CreatedAt
            };

            return Ok(patientDto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating patient", error = ex.Message });
        }
    }

    [HttpDelete("{patientId}")]
    public async Task<ActionResult> DeletePatient(string patientId)
    {
        try
        {
            var hospitalId = GetCurrentUserHospitalId();
            if (hospitalId == null)
            {
                return Forbid("Access denied. Hospital context required.");
            }

            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.PatientId == patientId && p.HospitalId == hospitalId);

            if (patient == null)
            {
                return NotFound(new { message = "Patient not found" });
            }

            // Soft delete by setting IsActive to false
            patient.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting patient", error = ex.Message });
        }
    }

    private Guid? GetCurrentUserHospitalId()
    {
        var hospitalIdClaim = User.FindFirst("hospitalId")?.Value;
        if (Guid.TryParse(hospitalIdClaim, out var hospitalId))
        {
            return hospitalId;
        }
        return null;
    }

    private async Task<string> GenerateUniquePatientId()
    {
        string patientId;
        bool isUnique;
        
        do
        {
            // Generate a 8-digit patient ID
            patientId = new Random().Next(10000000, 99999999).ToString();
            isUnique = !await _context.Patients.AnyAsync(p => p.PatientId == patientId);
        } while (!isUnique);

        return patientId;
    }
}
