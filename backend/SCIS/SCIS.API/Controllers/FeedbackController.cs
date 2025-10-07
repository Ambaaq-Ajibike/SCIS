using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SCIS.Core.DTOs;
using SCIS.Core.Interfaces;
using System.Security.Claims;

namespace SCIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FeedbackController : ControllerBase
{
    private readonly IFeedbackService _feedbackService;

    public FeedbackController(IFeedbackService feedbackService)
    {
        _feedbackService = feedbackService;
    }

    [HttpPost("submit")]
    public async Task<ActionResult<PatientFeedbackResponseDto>> SubmitFeedback([FromBody] PatientFeedbackDto feedback)
    {
        try
        {
            // Get patient ID from JWT token
            var patientIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userTypeClaim = User.FindFirst("userType")?.Value;
            
            if (string.IsNullOrEmpty(patientIdClaim) || userTypeClaim != "Patient")
            {
                return Unauthorized(new { message = "Patient authentication required" });
            }

            // Override the patient ID from the token
            feedback.PatientId = Guid.Parse(patientIdClaim);
            
            var response = await _feedbackService.SubmitFeedbackAsync(feedback);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while submitting feedback", error = ex.Message });
        }
    }

    [HttpGet("doctor/{doctorId}/average-tes")]
    public async Task<ActionResult<double>> GetDoctorAverageTES(Guid doctorId)
    {
        try
        {
            var averageTES = await _feedbackService.GetDoctorAverageTESAsync(doctorId);
            return Ok(new { doctorId, averageTES });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching doctor TES", error = ex.Message });
        }
    }

    [HttpGet("hospital/{hospitalId}/average-tes")]
    public async Task<ActionResult<double>> GetHospitalAverageTES(Guid hospitalId)
    {
        try
        {
            var averageTES = await _feedbackService.GetHospitalAverageTESAsync(hospitalId);
            return Ok(new { hospitalId, averageTES });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching hospital TES", error = ex.Message });
        }
    }

    [HttpGet("insights")]
    public async Task<ActionResult<List<object>>> GetPerformanceInsights()
    {
        try
        {
            var insights = await _feedbackService.GetPerformanceInsightsAsync();
            return Ok(insights);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching performance insights", error = ex.Message });
        }
    }

    [HttpGet("patient/doctors")]
    public async Task<ActionResult<List<object>>> GetPatientHospitalDoctors()
    {
        try
        {
            // Get patient hospital ID from JWT token
            var hospitalIdClaim = User.FindFirst("hospitalId")?.Value;
            var userTypeClaim = User.FindFirst("userType")?.Value;
            
            if (string.IsNullOrEmpty(hospitalIdClaim) || userTypeClaim != "Patient")
            {
                return Unauthorized(new { message = "Patient authentication required" });
            }

            var doctors = await _feedbackService.GetDoctorsByHospitalAsync(Guid.Parse(hospitalIdClaim));
            return Ok(doctors);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching doctors", error = ex.Message });
        }
    }
}
