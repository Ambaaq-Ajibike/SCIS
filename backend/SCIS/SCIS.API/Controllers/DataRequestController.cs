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
public class DataRequestController : ControllerBase
{
    private readonly IDataRequestService _dataRequestService;
    private readonly SCISDbContext _context;

    public DataRequestController(IDataRequestService dataRequestService, SCISDbContext context)
    {
        _dataRequestService = dataRequestService;
        _context = context;
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

    [HttpPost("approve")]
    public async Task<ActionResult<DataRequestResponseDto>> ApproveDataRequest([FromBody] DataRequestApprovalDto approval)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized(new { message = "Invalid user" });

            var response = await _dataRequestService.ApproveDataRequestAsync(approval, userId);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while processing the approval", error = ex.Message });
        }
    }

    [HttpGet("pending")]
    public async Task<ActionResult<List<PendingDataRequestDto>>> GetPendingRequests()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized(new { message = "Invalid user" });

            // Get user's hospital ID
            var user = await _context.Users
                .Include(u => u.Hospital)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user?.HospitalId == null)
                return Unauthorized(new { message = "User not associated with a hospital" });

            var pendingRequests = await _dataRequestService.GetPendingRequestsAsync(user.HospitalId.Value);
            return Ok(pendingRequests);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching pending requests", error = ex.Message });
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

            var history = await _dataRequestService.GetRequestHistoryAsync(userId);
            return Ok(history);
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
