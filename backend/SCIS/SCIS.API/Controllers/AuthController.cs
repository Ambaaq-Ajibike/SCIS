using Microsoft.AspNetCore.Mvc;
using SCIS.Core.DTOs;
using SCIS.Core.Interfaces;

namespace SCIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            if (response == null)
                return Unauthorized(new { message = "Invalid credentials" });

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during login", error = ex.Message });
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
                await _authService.LogoutAsync(token);
            }
            return Ok(new { message = "Logged out successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during logout", error = ex.Message });
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

            var isValid = await _authService.ValidateTokenAsync(token);
            if (!isValid)
                return Unauthorized(new { message = "Invalid token" });

            return Ok(new { message = "Token is valid" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during token validation", error = ex.Message });
        }
    }
}
