using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SCIS.Core.DTOs;
using SCIS.Core.Interfaces;
using System.Security.Claims;

namespace SCIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HospitalSettingsController : ControllerBase
{
    private readonly IHospitalSettingsService _hospitalSettingsService;
    private readonly ILogger<HospitalSettingsController> _logger;

    public HospitalSettingsController(
        IHospitalSettingsService hospitalSettingsService,
        ILogger<HospitalSettingsController> logger)
    {
        _hospitalSettingsService = hospitalSettingsService;
        _logger = logger;
    }

    [HttpGet("{hospitalId}")]
    public async Task<ActionResult<HospitalSettingsDto>> GetHospitalSettings(Guid hospitalId)
    {
        try
        {
            var settings = await _hospitalSettingsService.GetHospitalSettingsAsync(hospitalId);
            
            if (settings == null)
            {
                return NotFound(new { message = "Hospital settings not found" });
            }

            return Ok(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving hospital settings for hospital {HospitalId}", hospitalId);
            return StatusCode(500, new { message = "An error occurred while retrieving hospital settings", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<HospitalSettingsDto>> CreateHospitalSettings([FromBody] CreateHospitalSettingsDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var settings = await _hospitalSettingsService.CreateHospitalSettingsAsync(dto);
            return CreatedAtAction(nameof(GetHospitalSettings), new { hospitalId = settings.HospitalId }, settings);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating hospital settings for hospital {HospitalId}", dto.HospitalId);
            return StatusCode(500, new { message = "An error occurred while creating hospital settings", error = ex.Message });
        }
    }

    [HttpPut("{hospitalId}")]
    public async Task<ActionResult<HospitalSettingsDto>> UpdateHospitalSettings(Guid hospitalId, [FromBody] UpdateHospitalSettingsDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var settings = await _hospitalSettingsService.UpdateHospitalSettingsAsync(hospitalId, dto);
            return Ok(settings);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating hospital settings for hospital {HospitalId}", hospitalId);
            return StatusCode(500, new { message = "An error occurred while updating hospital settings", error = ex.Message });
        }
    }

    [HttpDelete("{hospitalId}")]
    public async Task<ActionResult> DeleteHospitalSettings(Guid hospitalId)
    {
        try
        {
            var deleted = await _hospitalSettingsService.DeleteHospitalSettingsAsync(hospitalId);
            
            if (!deleted)
            {
                return NotFound(new { message = "Hospital settings not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting hospital settings for hospital {HospitalId}", hospitalId);
            return StatusCode(500, new { message = "An error occurred while deleting hospital settings", error = ex.Message });
        }
    }

    [HttpPost("validate-endpoint")]
    public async Task<ActionResult<EndpointValidationDto>> ValidateEndpoint([FromBody] ValidateEndpointRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var validationResult = await _hospitalSettingsService.ValidateEndpointAsync(request.EndpointUrl, request.EndpointType);
            return Ok(validationResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating endpoint {EndpointUrl}", request.EndpointUrl);
            return StatusCode(500, new { message = "An error occurred while validating endpoint", error = ex.Message });
        }
    }

    [HttpPost("{hospitalId}/validate-all")]
    public async Task<ActionResult<HospitalSettingsDto>> ValidateAllEndpoints(Guid hospitalId)
    {
        try
        {
            var settings = await _hospitalSettingsService.ValidateAllEndpointsAsync(hospitalId);
            return Ok(settings);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating all endpoints for hospital {HospitalId}", hospitalId);
            return StatusCode(500, new { message = "An error occurred while validating endpoints", error = ex.Message });
        }
    }

    [HttpPost("{hospitalId}/validate-specific")]
    public async Task<ActionResult<List<EndpointValidationDto>>> ValidateSpecificEndpoints(
        Guid hospitalId, 
        [FromBody] ValidateSpecificEndpointsRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var validationResults = await _hospitalSettingsService.ValidateSpecificEndpointsAsync(hospitalId, request.EndpointTypes);
            return Ok(validationResults);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating specific endpoints for hospital {HospitalId}", hospitalId);
            return StatusCode(500, new { message = "An error occurred while validating endpoints", error = ex.Message });
        }
    }
}

public class ValidateEndpointRequest
{
    public string EndpointUrl { get; set; } = string.Empty;
    public string EndpointType { get; set; } = string.Empty;
}

public class ValidateSpecificEndpointsRequest
{
    public List<string> EndpointTypes { get; set; } = new();
}
