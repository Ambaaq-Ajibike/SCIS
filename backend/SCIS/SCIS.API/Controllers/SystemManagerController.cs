using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SCIS.Core.DTOs;
using SCIS.Core.Interfaces;

namespace SCIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SystemManager")]
public class SystemManagerController : ControllerBase
{
    private readonly ISystemManagerService _systemManagerService;

    public SystemManagerController(ISystemManagerService systemManagerService)
    {
        _systemManagerService = systemManagerService;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<SystemManagerDashboardDto>> GetDashboard()
    {
        try
        {
            var dashboard = await _systemManagerService.GetSystemDashboardAsync();
            return Ok(dashboard);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving dashboard data", error = ex.Message });
        }
    }

    [HttpGet("analytics")]
    public async Task<ActionResult<SystemAnalyticsDto>> GetSystemAnalytics()
    {
        try
        {
            var analytics = await _systemManagerService.GetSystemAnalyticsAsync();
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving system analytics", error = ex.Message });
        }
    }

    [HttpGet("hospitals")]
    public async Task<ActionResult<List<HospitalAnalyticsDto>>> GetAllHospitals()
    {
        try
        {
            var hospitals = await _systemManagerService.GetAllHospitalsAnalyticsAsync();
            return Ok(hospitals);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving hospitals", error = ex.Message });
        }
    }

    [HttpGet("hospitals/{hospitalId}")]
    public async Task<ActionResult<HospitalDetailDto>> GetHospitalDetail(Guid hospitalId)
    {
        try
        {
            var hospitalDetail = await _systemManagerService.GetHospitalDetailAsync(hospitalId);
            return Ok(hospitalDetail);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving hospital details", error = ex.Message });
        }
    }

    [HttpGet("doctors")]
    public async Task<ActionResult<List<DoctorPerformanceDto>>> GetAllDoctors()
    {
        try
        {
            var doctors = await _systemManagerService.GetAllDoctorsPerformanceAsync();
            return Ok(doctors);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving doctors", error = ex.Message });
        }
    }

    [HttpGet("hospitals/{hospitalId}/doctors")]
    public async Task<ActionResult<List<DoctorPerformanceDto>>> GetDoctorsByHospital(Guid hospitalId)
    {
        try
        {
            var doctors = await _systemManagerService.GetDoctorsByHospitalAsync(hospitalId);
            return Ok(doctors);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving doctors", error = ex.Message });
        }
    }

    [HttpGet("data-requests")]
    public async Task<ActionResult<List<DataRequestResponseDto>>> GetAllDataRequests()
    {
        try
        {
            var dataRequests = await _systemManagerService.GetAllDataRequestsAsync();
            return Ok(dataRequests);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving data requests", error = ex.Message });
        }
    }

    [HttpGet("hospitals/{hospitalId}/data-requests")]
    public async Task<ActionResult<List<DataRequestResponseDto>>> GetDataRequestsByHospital(Guid hospitalId)
    {
        try
        {
            var dataRequests = await _systemManagerService.GetDataRequestsByHospitalAsync(hospitalId);
            return Ok(dataRequests);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving data requests", error = ex.Message });
        }
    }

    [HttpGet("feedbacks")]
    public async Task<ActionResult<List<PatientFeedbackResponseDto>>> GetAllFeedbacks()
    {
        try
        {
            var feedbacks = await _systemManagerService.GetAllFeedbacksAsync();
            return Ok(feedbacks);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving feedbacks", error = ex.Message });
        }
    }

    [HttpGet("hospitals/{hospitalId}/feedbacks")]
    public async Task<ActionResult<List<PatientFeedbackResponseDto>>> GetFeedbacksByHospital(Guid hospitalId)
    {
        try
        {
            var feedbacks = await _systemManagerService.GetFeedbacksByHospitalAsync(hospitalId);
            return Ok(feedbacks);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while retrieving feedbacks", error = ex.Message });
        }
    }
}
