using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SCIS.Core.DTOs;
using SCIS.Core.Interfaces;
using System.Security.Claims;

namespace SCIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OnboardingController : ControllerBase
{
    private readonly IOnboardingService _onboardingService;
    private readonly ILogger<OnboardingController> _logger;

    public OnboardingController(
        IOnboardingService onboardingService,
        ILogger<OnboardingController> logger)
    {
        _onboardingService = onboardingService;
        _logger = logger;
    }

    [HttpPost("register-hospital")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> RegisterHospital([FromBody] RegisterHospitalDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _onboardingService.RegisterHospitalAsync(dto);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering hospital");
            return StatusCode(500, new { message = "An error occurred while registering the hospital", error = ex.Message });
        }
    }

    [HttpPost("create-doctor")]
    [Authorize(Roles = "HospitalManager")]
    public async Task<ActionResult<DoctorDto>> CreateDoctor([FromBody] CreateDoctorDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var hospitalIdClaim = User.FindFirst("hospitalId")?.Value;
            if (string.IsNullOrEmpty(hospitalIdClaim) || !Guid.TryParse(hospitalIdClaim, out var hospitalId))
            {
                return BadRequest(new { message = "Invalid hospital ID" });
            }

            var doctor = await _onboardingService.CreateDoctorAsync(dto, hospitalId);
            return Ok(doctor);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating doctor");
            return StatusCode(500, new { message = "An error occurred while creating the doctor", error = ex.Message });
        }
    }

    [HttpPost("approve-hospital")]
    [Authorize(Roles = "SystemManager")]
    public async Task<ActionResult> ApproveHospital([FromBody] ApproveHospitalDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return BadRequest(new { message = "Invalid user ID" });
            }

            var result = await _onboardingService.ApproveHospitalAsync(
                dto.HospitalId, 
                dto.IsApproved, 
                userId, 
                dto.ApprovalNotes);

            if (result)
            {
                return Ok(new { message = dto.IsApproved ? "Hospital approved successfully" : "Hospital rejection recorded" });
            }

            return BadRequest(new { message = "Failed to update hospital approval status" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving hospital");
            return StatusCode(500, new { message = "An error occurred while approving the hospital", error = ex.Message });
        }
    }

    [HttpGet("pending-hospitals")]
    [Authorize(Roles = "SystemManager")]
    public async Task<ActionResult<List<HospitalDto>>> GetPendingHospitals()
    {
        try
        {
            var hospitals = await _onboardingService.GetPendingHospitalsAsync();
            return Ok(hospitals);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting pending hospitals");
            return StatusCode(500, new { message = "An error occurred while retrieving pending hospitals", error = ex.Message });
        }
    }

    [HttpGet("hospital/{hospitalId}")]
    [Authorize(Roles = "SystemManager")]
    public async Task<ActionResult<HospitalDto>> GetHospital(Guid hospitalId)
    {
        try
        {
            var hospital = await _onboardingService.GetHospitalByIdAsync(hospitalId);
            if (hospital == null)
            {
                return NotFound(new { message = "Hospital not found" });
            }

            return Ok(hospital);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting hospital");
            return StatusCode(500, new { message = "An error occurred while retrieving the hospital", error = ex.Message });
        }
    }
}

