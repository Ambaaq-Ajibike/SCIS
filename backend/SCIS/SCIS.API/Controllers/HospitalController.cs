using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SCIS.Core.DTOs;
using SCIS.Infrastructure.Data;

namespace SCIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HospitalController : ControllerBase
{
    private readonly SCISDbContext _context;

    public HospitalController(SCISDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<HospitalDto>>> GetHospitals()
    {
        try
        {
            // Fetch hospitals from database
            var hospitals = await _context.Hospitals
                .Where(h => h.IsActive)
                .Select(h => new HospitalDto
                {
                    Id = h.Id.ToString(),
                    Name = h.Name,
                    Address = h.Address,
                    PhoneNumber = h.PhoneNumber ?? "",
                    IsActive = h.IsActive,
                    CreatedAt = h.CreatedAt
                })
                .ToListAsync();

            return Ok(hospitals);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching hospitals", error = ex.Message });
        }
    }

    [HttpGet("{hospitalId}/doctors")]
    public async Task<ActionResult<List<DoctorDto>>> GetDoctorsByHospital(string hospitalId)
    {
        try
        {
            // Parse hospitalId to Guid
            if (!Guid.TryParse(hospitalId, out var hospitalGuid))
            {
                return BadRequest(new { message = "Invalid hospital ID format" });
            }

            // Fetch doctors (users with Doctor role) from database for the specified hospital
            var doctors = await _context.Users
                .Where(u => u.Role == "Doctor" && u.HospitalId == hospitalGuid && u.IsActive)
                .Include(u => u.Hospital)
                .Select(u => new DoctorDto
                {
                    Id = u.Id.ToString(),
                    FirstName = u.Username, // Using username as first name for now
                    LastName = "", // We don't have separate first/last name fields in User entity
                    Specialty = "General Medicine", // Default specialty since we don't have this field
                    HospitalId = u.HospitalId.HasValue ? u.HospitalId.Value.ToString() : "",
                    HospitalName = u.Hospital != null ? u.Hospital.Name : "Unknown Hospital",
                    IsActive = u.IsActive
                })
                .ToListAsync();

            return Ok(doctors);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching doctors", error = ex.Message });
        }
    }
}
