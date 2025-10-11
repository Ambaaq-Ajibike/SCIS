using Microsoft.AspNetCore.Mvc;
using SCIS.Core.DTOs;
using SCIS.Core.Interfaces;

namespace SCIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PatientAuthController : ControllerBase
{
    private readonly IPatientAuthService _patientAuthService;

    public PatientAuthController(IPatientAuthService patientAuthService)
    {
        _patientAuthService = patientAuthService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<PatientLoginResponse>> Login([FromBody] PatientLoginRequest request)
    {
        try
        {
            var response = await _patientAuthService.LoginAsync(request);
            if (response == null)
                return Unauthorized(new { message = "Invalid patient credentials" });

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during patient login", error = ex.Message });
        }
    }

    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        try
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            if (token != null)
            {
                await _patientAuthService.LogoutAsync(token);
            }
            return Ok(new { message = "Patient logged out successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during patient logout", error = ex.Message });
        }
    }

    [HttpPost("validate")]
    public async Task<ActionResult> ValidateToken()
    {
        try
        {
            var token = Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            if (string.IsNullOrEmpty(token))
                return Unauthorized(new { message = "No token provided" });

            var isValid = await _patientAuthService.ValidateTokenAsync(token);
            if (!isValid)
                return Unauthorized(new { message = "Invalid token" });

            return Ok(new { message = "Token is valid" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during token validation", error = ex.Message });
        }
    }

    [HttpPost("complete-signup")]
    public async Task<ActionResult<PatientLoginResponse>> CompleteSignup([FromBody] CompletePatientSignupDto request)
    {
        try
        {
            var response = await _patientAuthService.CompleteSignupAsync(request);
            if (response == null)
                return BadRequest(new { message = "Invalid patient ID or signup already completed" });

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during signup completion", error = ex.Message });
        }
    }
}
