using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SCIS.Core.DTOs;
using SCIS.Core.Interfaces;
using System.Security.Claims;

namespace SCIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DataRequestController : ControllerBase
{
    private readonly IDataRequestService _dataRequestService;

    public DataRequestController(IDataRequestService dataRequestService)
    {
        _dataRequestService = dataRequestService;
    }

    [HttpPost("request")]
    public async Task<ActionResult<DataRequestResponseDto>> RequestData([FromBody] DataRequestDto request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized(new { message = "Invalid user" });

            var response = await _dataRequestService.RequestDataAsync(request, userId);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while processing the data request", error = ex.Message });
        }
    }

    [HttpGet("history")]
    public async Task<ActionResult<List<DataRequestResponseDto>>> GetRequestHistory()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized(new { message = "Invalid user" });

            // This would typically fetch from a repository
            // For now, return empty list
            return Ok(new List<DataRequestResponseDto>());
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching request history", error = ex.Message });
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }
}
