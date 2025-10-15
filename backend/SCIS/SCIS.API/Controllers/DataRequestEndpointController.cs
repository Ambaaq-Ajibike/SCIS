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
[Authorize]
public class DataRequestEndpointController : ControllerBase
{
    private readonly IDataRequestEndpointService _endpointService;
    private readonly SCISDbContext _context;

    public DataRequestEndpointController(IDataRequestEndpointService endpointService, SCISDbContext context)
    {
        _endpointService = endpointService;
        _context = context;
    }

    [HttpGet("hospital/{hospitalId}")]
    public async Task<ActionResult<List<DataRequestEndpointDto>>> GetEndpointsByHospital(Guid hospitalId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized(new { message = "Invalid user" });

            // Check if user has access to this hospital
            var user = await _context.Users
                .Include(u => u.Hospital)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.HospitalId != hospitalId && user?.Role != "SystemAdmin")
                return Forbid("Access denied to this hospital's endpoints");

            var endpoints = await _endpointService.GetEndpointsByHospitalAsync(hospitalId);
            return Ok(endpoints);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching endpoints", error = ex.Message });
        }
    }

    [HttpGet("{endpointId}")]
    public async Task<ActionResult<DataRequestEndpointDto>> GetEndpointById(Guid endpointId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized(new { message = "Invalid user" });

            var endpoint = await _endpointService.GetEndpointByIdAsync(endpointId);
            if (endpoint == null)
                return NotFound(new { message = "Endpoint not found" });

            // Check if user has access to this endpoint's hospital
            var user = await _context.Users
                .Include(u => u.Hospital)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.HospitalId != endpoint.HospitalId && user?.Role != "SystemAdmin")
                return Forbid("Access denied to this endpoint");

            return Ok(endpoint);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching endpoint", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<DataRequestEndpointDto>> CreateEndpoint([FromBody] CreateDataRequestEndpointDto createDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized(new { message = "Invalid user" });

            // Check if user has access to this hospital
            var user = await _context.Users
                .Include(u => u.Hospital)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.HospitalId != createDto.HospitalId && user?.Role != "SystemAdmin")
                return Forbid("Access denied to create endpoints for this hospital");

            // Check if user has permission to create endpoints
            if (user?.Role != "HospitalManager" && user?.Role != "SystemAdmin")
                return Forbid("Insufficient permissions to create endpoints");

            var endpoint = await _endpointService.CreateEndpointAsync(createDto);
            return CreatedAtAction(nameof(GetEndpointById), new { endpointId = endpoint.Id }, endpoint);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while creating endpoint", error = ex.Message });
        }
    }

    [HttpPut("{endpointId}")]
    public async Task<ActionResult<DataRequestEndpointDto>> UpdateEndpoint(Guid endpointId, [FromBody] UpdateDataRequestEndpointDto updateDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized(new { message = "Invalid user" });

            // Check if user has access to this endpoint
            var existingEndpoint = await _endpointService.GetEndpointByIdAsync(endpointId);
            if (existingEndpoint == null)
                return NotFound(new { message = "Endpoint not found" });

            var user = await _context.Users
                .Include(u => u.Hospital)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.HospitalId != existingEndpoint.HospitalId && user?.Role != "SystemAdmin")
                return Forbid("Access denied to update this endpoint");

            // Check if user has permission to update endpoints
            if (user?.Role != "HospitalManager" && user?.Role != "SystemAdmin")
                return Forbid("Insufficient permissions to update endpoints");

            var endpoint = await _endpointService.UpdateEndpointAsync(endpointId, updateDto);
            return Ok(endpoint);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while updating endpoint", error = ex.Message });
        }
    }

    [HttpDelete("{endpointId}")]
    public async Task<ActionResult> DeleteEndpoint(Guid endpointId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized(new { message = "Invalid user" });

            // Check if user has access to this endpoint
            var existingEndpoint = await _endpointService.GetEndpointByIdAsync(endpointId);
            if (existingEndpoint == null)
                return NotFound(new { message = "Endpoint not found" });

            var user = await _context.Users
                .Include(u => u.Hospital)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.HospitalId != existingEndpoint.HospitalId && user?.Role != "SystemAdmin")
                return Forbid("Access denied to delete this endpoint");

            // Check if user has permission to delete endpoints
            if (user?.Role != "HospitalManager" && user?.Role != "SystemAdmin")
                return Forbid("Insufficient permissions to delete endpoints");

            var success = await _endpointService.DeleteEndpointAsync(endpointId);
            if (!success)
                return NotFound(new { message = "Endpoint not found" });

            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while deleting endpoint", error = ex.Message });
        }
    }

    [HttpPost("{endpointId}/validate")]
    public async Task<ActionResult> ValidateEndpoint(Guid endpointId)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized(new { message = "Invalid user" });

            // Check if user has access to this endpoint
            var existingEndpoint = await _endpointService.GetEndpointByIdAsync(endpointId);
            if (existingEndpoint == null)
                return NotFound(new { message = "Endpoint not found" });

            var user = await _context.Users
                .Include(u => u.Hospital)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.HospitalId != existingEndpoint.HospitalId && user?.Role != "SystemAdmin")
                return Forbid("Access denied to validate this endpoint");

            var isValid = await _endpointService.ValidateEndpointAsync(endpointId);
            return Ok(new { isValid = isValid });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while validating endpoint", error = ex.Message });
        }
    }

    [HttpGet("data-types")]
    public async Task<ActionResult<List<string>>> GetAvailableDataTypes()
    {
        try
        {
            var dataTypes = await _endpointService.GetAvailableDataTypesAsync();
            return Ok(dataTypes);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching data types", error = ex.Message });
        }
    }

    [HttpGet("fhir-resource-types")]
    public async Task<ActionResult<List<string>>> GetAvailableFhirResourceTypes()
    {
        try
        {
            var resourceTypes = await _endpointService.GetAvailableFhirResourceTypesAsync();
            return Ok(resourceTypes);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching FHIR resource types", error = ex.Message });
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }
}
