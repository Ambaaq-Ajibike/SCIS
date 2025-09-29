using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SCIS.Core.Interfaces;

namespace SCIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MLController : ControllerBase
{
    private readonly IMLService _mlService;

    public MLController(IMLService mlService)
    {
        _mlService = mlService;
    }

    [HttpPost("clustering")]
    public async Task<ActionResult<List<object>>> PerformClustering([FromBody] List<object> data)
    {
        try
        {
            var results = await _mlService.PerformClusteringAsync(data);
            return Ok(results);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during clustering analysis", error = ex.Message });
        }
    }

    [HttpPost("sentiment")]
    public async Task<ActionResult<string>> AnalyzeSentiment([FromBody] string text)
    {
        try
        {
            var sentiment = await _mlService.AnalyzeSentimentAsync(text);
            return Ok(new { text, sentiment });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during sentiment analysis", error = ex.Message });
        }
    }

    [HttpGet("forecast/{hospitalId}")]
    public async Task<ActionResult<List<object>>> ForecastPatientVolumes(int hospitalId, [FromQuery] int days = 7)
    {
        try
        {
            var forecast = await _mlService.ForecastPatientVolumesAsync(hospitalId, days);
            return Ok(forecast);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during volume forecasting", error = ex.Message });
        }
    }

    [HttpGet("performance-index/{hospitalId}")]
    public async Task<ActionResult<double>> CalculatePerformanceIndex(int hospitalId)
    {
        try
        {
            var performanceIndex = await _mlService.CalculatePerformanceIndexAsync(hospitalId);
            return Ok(new { hospitalId, performanceIndex });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while calculating performance index", error = ex.Message });
        }
    }

    [HttpGet("gaps")]
    public async Task<ActionResult<List<object>>> GetPerformanceGaps()
    {
        try
        {
            var gaps = await _mlService.GetPerformanceGapsAsync();
            return Ok(gaps);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching performance gaps", error = ex.Message });
        }
    }

    [HttpGet("recommendations/{hospitalId}")]
    public async Task<ActionResult<List<object>>> GetResourceRecommendations(int hospitalId)
    {
        try
        {
            var recommendations = await _mlService.GetResourceRecommendationsAsync(hospitalId);
            return Ok(recommendations);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching resource recommendations", error = ex.Message });
        }
    }
}
