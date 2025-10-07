using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SCIS.Core.DTOs;
using SCIS.Core.Interfaces;
using SCIS.Infrastructure.Data;
using System.Security.Claims;

namespace SCIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PatientController : ControllerBase
{
    private readonly SCISDbContext _context;

    public PatientController(SCISDbContext context)
    {
        _context = context;
    }

    [HttpGet("{patientId}")]
    public async Task<ActionResult<PatientDto>> GetPatientById(string patientId)
    {
        try
        {
            // Fetch patient from database with hospital information
            var patient = await _context.Patients
                .Include(p => p.Hospital)
                .FirstOrDefaultAsync(p => p.PatientId == patientId);

            if (patient == null)
            {
                return NotFound(new { message = "Patient not found" });
            }

            // Convert to DTO
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
                BiometricConsent = patient.BiometricConsent,
                BiometricConsentDate = patient.BiometricConsentDate,
                CreatedAt = patient.CreatedAt
            };

            return Ok(patientDto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching patient", error = ex.Message });
        }
    }
}
