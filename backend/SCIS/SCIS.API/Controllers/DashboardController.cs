using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SCIS.Core.DTOs;
using SCIS.Infrastructure.Data;
using System.Security.Claims;

namespace SCIS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController(SCISDbContext _context) : ControllerBase
{

    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetDashboardStats()
    {
        try
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var hospitalIdClaim = User.FindFirst("hospitalId")?.Value;

            if (string.IsNullOrEmpty(userRole) || string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Invalid user context" });
            }

            if (userRole == "SystemManager")
            {
                // System Manager sees all data
                return await GetSystemManagerStats();
            }
            else if (userRole == "HospitalManager" && !string.IsNullOrEmpty(hospitalIdClaim))
            {
                // Hospital Manager sees only their hospital data
                if (!Guid.TryParse(hospitalIdClaim, out var hospitalId))
                {
                    return BadRequest(new { message = "Invalid hospital ID" });
                }
                return await GetHospitalManagerStats(hospitalId);
            }
            else
            {
                return Unauthorized(new { message = "Insufficient permissions" });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching dashboard stats", error = ex.Message });
        }
    }

    [HttpGet("hospital-performance")]
    public async Task<ActionResult<List<object>>> GetHospitalPerformance()
    {
        try
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var hospitalIdClaim = User.FindFirst("hospitalId")?.Value;

            if (userRole == "SystemManager")
            {
                // System Manager sees all hospitals
                return await GetAllHospitalPerformance();
            }
            else if (userRole == "HospitalManager" && !string.IsNullOrEmpty(hospitalIdClaim))
            {
                // Hospital Manager sees only their hospital
                if (!Guid.TryParse(hospitalIdClaim, out var hospitalId))
                {
                    return BadRequest(new { message = "Invalid hospital ID" });
                }
                return await GetSingleHospitalPerformance(hospitalId);
            }
            else
            {
                return Unauthorized(new { message = "Insufficient permissions" });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching hospital performance", error = ex.Message });
        }
    }

    [HttpGet("sentiment-analysis")]
    public async Task<ActionResult<List<object>>> GetSentimentAnalysis()
    {
        try
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var hospitalIdClaim = User.FindFirst("hospitalId")?.Value;

            if (userRole == "SystemManager")
            {
                // System Manager sees all feedback sentiment
                return await GetAllSentimentAnalysis();
            }
            else if (userRole == "HospitalManager" && !string.IsNullOrEmpty(hospitalIdClaim))
            {
                // Hospital Manager sees only their hospital feedback sentiment
                if (!Guid.TryParse(hospitalIdClaim, out var hospitalId))
                {
                    return BadRequest(new { message = "Invalid hospital ID" });
                }
                return await GetHospitalSentimentAnalysis(hospitalId);
            }
            else
            {
                return Unauthorized(new { message = "Insufficient permissions" });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching sentiment analysis", error = ex.Message });
        }
    }

    [HttpGet("doctors")]
    public async Task<ActionResult<List<object>>> GetDoctors()
    {
        try
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var hospitalIdClaim = User.FindFirst("hospitalId")?.Value;

            if (userRole == "SystemManager")
            {
                // System Manager sees all doctors
                return await GetAllDoctors();
            }
            else if (userRole == "HospitalManager" && !string.IsNullOrEmpty(hospitalIdClaim))
            {
                // Hospital Manager sees only their hospital doctors
                if (!Guid.TryParse(hospitalIdClaim, out var hospitalId))
                {
                    return BadRequest(new { message = "Invalid hospital ID" });
                }
                return await GetHospitalDoctors(hospitalId);
            }
            else
            {
                return Unauthorized(new { message = "Insufficient permissions" });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching doctors", error = ex.Message });
        }
    }

    [HttpGet("patients")]
    public async Task<ActionResult<List<object>>> GetPatients()
    {
        try
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var hospitalIdClaim = User.FindFirst("hospitalId")?.Value;

            if (userRole == "SystemManager")
            {
                // System Manager sees all patients
                return await GetAllPatients();
            }
            else if (userRole == "HospitalManager" && !string.IsNullOrEmpty(hospitalIdClaim))
            {
                // Hospital Manager sees only their hospital patients
                if (!Guid.TryParse(hospitalIdClaim, out var hospitalId))
                {
                    return BadRequest(new { message = "Invalid hospital ID" });
                }
                return await GetHospitalPatients(hospitalId);
            }
            else
            {
                return Unauthorized(new { message = "Insufficient permissions" });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred while fetching patients", error = ex.Message });
        }
    }

    private async Task<object> GetSystemManagerStats()
    {
        var totalHospitals = await _context.Hospitals.CountAsync(h => h.IsActive);
        var totalPatients = await _context.Patients.CountAsync(p => p.IsActive);
        var totalDoctors = await _context.Users.CountAsync(u => u.Role == "Doctor" && u.IsActive);
        
        // Calculate average TES across all hospitals
        var averageTES = await _context.PatientFeedbacks
            .Where(pf => pf.TreatmentEvaluationScore > 0)
            .AverageAsync(pf => (double?)pf.TreatmentEvaluationScore) ?? 0;

        // Calculate interoperability rate (based on successful data requests)
        var totalDataRequests = await _context.DataRequests.CountAsync();
        var successfulDataRequests = await _context.DataRequests.CountAsync(dr => dr.Status == "Approved");
        var interoperabilityRate = totalDataRequests > 0 ? (double)successfulDataRequests / totalDataRequests * 100 : 0;

        // Calculate performance index (combination of TES and interoperability)
        var performanceIndex = (averageTES + interoperabilityRate) / 2;

        // Count alerts (doctors with TES below 70%)
        var alertsCount = await _context.Users
            .Where(u => u.Role == "Doctor" && u.IsActive)
            .SelectMany(u => u.PatientFeedbacks)
            .GroupBy(pf => pf.DoctorId)
            .Where(g => g.Average(pf => pf.TreatmentEvaluationScore) < 70)
            .CountAsync();

        return new
        {
            totalHospitals,
            totalPatients,
            totalDoctors,
            averageTES = Math.Round(averageTES, 1),
            interoperabilityRate = Math.Round(interoperabilityRate, 1),
            performanceIndex = Math.Round(performanceIndex, 1),
            alertsCount
        };
    }

    private async Task<object> GetHospitalManagerStats(Guid hospitalId)
    {
        var hospital = await _context.Hospitals.FirstOrDefaultAsync(h => h.Id == hospitalId) ?? throw new ArgumentException("Hospital not found");
        var totalPatients = await _context.Patients.CountAsync(p => p.HospitalId == hospitalId && p.IsActive);
        var totalDoctors = await _context.Users.CountAsync(u => u.Role == "Doctor" && u.HospitalId == hospitalId && u.IsActive);
        
        // Calculate average TES for this hospital
        var averageTES = await _context.PatientFeedbacks
            .Where(pf => pf.Patient.HospitalId == hospitalId)
            .AverageAsync(pf => (double?)pf.TreatmentEvaluationScore) ?? 0;

        // Calculate interoperability rate for this hospital
        var totalDataRequests = await _context.DataRequests
            .CountAsync(dr => dr.Patient.HospitalId == hospitalId);
        var successfulDataRequests = await _context.DataRequests
            .CountAsync(dr => dr.Patient.HospitalId == hospitalId && dr.Status == "Approved");
        var interoperabilityRate = totalDataRequests > 0 ? (double)successfulDataRequests / totalDataRequests * 100 : 0;

        // Calculate performance index
        var performanceIndex = (averageTES + interoperabilityRate) / 2;

        // Count alerts for this hospital (doctors with TES below 70%)
        var alertsCount = await _context.Users
            .Where(u => u.Role == "Doctor" && u.HospitalId == hospitalId && u.IsActive)
            .SelectMany(u => u.PatientFeedbacks)
            .Where(pf => pf.Patient.HospitalId == hospitalId)
            .GroupBy(pf => pf.DoctorId)
            .Where(g => g.Average(pf => pf.TreatmentEvaluationScore) < 70)
            .CountAsync();

        return new
        {
            hospitalName = hospital.Name,
            totalPatients,
            totalDoctors,
            averageTES = Math.Round(averageTES, 1),
            interoperabilityRate = Math.Round(interoperabilityRate, 1),
            performanceIndex = Math.Round(performanceIndex, 1),
            alertsCount
        };
    }

    private async Task<List<object>> GetAllHospitalPerformance()
    {
        var hospitals = await _context.Hospitals
            .Where(h => h.IsActive)
            .Select(h => new
            {
                h.Id,
                h.Name,
                PatientCount = h.Patients.Count(p => p.IsActive),
                DoctorCount = h.Users.Count(u => u.Role == "Doctor" && u.IsActive),
                AverageTES = h.PatientFeedbacks.Any() ? 
                    h.PatientFeedbacks.Average(pf => pf.TreatmentEvaluationScore) : 0,
                h.PerformanceIndex
            })
            .ToListAsync();

        return [.. hospitals.Select((h, index) => new
        {
            hospitalId = h.Id,
            hospitalName = h.Name,
            averageTES = Math.Round(h.AverageTES, 1),
            patientVolume = h.PatientCount,
            performanceIndex = Math.Round(h.PerformanceIndex, 1),
            ranking = index + 1
        }).Cast<object>()];
    }

    private async Task<List<object>> GetSingleHospitalPerformance(Guid hospitalId)
    {
        var hospital = await _context.Hospitals
            .Where(h => h.Id == hospitalId && h.IsActive)
            .Select(h => new
            {
                h.Id,
                h.Name,
                PatientCount = h.Patients.Count(p => p.IsActive),
                DoctorCount = h.Users.Count(u => u.Role == "Doctor" && u.IsActive),
                AverageTES = h.PatientFeedbacks.Any() ? 
                    h.PatientFeedbacks.Average(pf => pf.TreatmentEvaluationScore) : 0,
                h.PerformanceIndex
            })
            .FirstOrDefaultAsync();

        if (hospital == null)
        {
            return new List<object>();
        }

        return new List<object>
        {
            new
            {
                hospitalId = hospital.Id,
                hospitalName = hospital.Name,
                averageTES = Math.Round(hospital.AverageTES, 1),
                patientVolume = hospital.PatientCount,
                performanceIndex = Math.Round(hospital.PerformanceIndex, 1),
                ranking = 1
            }
        };
    }

    private async Task<List<object>> GetAllSentimentAnalysis()
    {
        var sentimentData = await _context.PatientFeedbacks
            .Where(pf => !string.IsNullOrEmpty(pf.SentimentAnalysis))
            .GroupBy(pf => pf.SentimentAnalysis)
            .Select(g => new
            {
                Sentiment = g.Key,
                Count = g.Count(),
                Percentage = 0.0 // Will calculate below
            })
            .ToListAsync();

        var totalCount = sentimentData.Sum(s => s.Count);
        
        return sentimentData.Select(s => new
        {
            sentiment = s.Sentiment,
            count = s.Count,
            percentage = totalCount > 0 ? Math.Round((double)s.Count / totalCount * 100, 1) : 0
        }).Cast<object>().ToList();
    }

    private async Task<List<object>> GetHospitalSentimentAnalysis(Guid hospitalId)
    {
        var sentimentData = await _context.PatientFeedbacks
            .Where(pf => pf.Patient.HospitalId == hospitalId && !string.IsNullOrEmpty(pf.SentimentAnalysis))
            .GroupBy(pf => pf.SentimentAnalysis)
            .Select(g => new
            {
                Sentiment = g.Key,
                Count = g.Count(),
                Percentage = 0.0 // Will calculate below
            })
            .ToListAsync();

        var totalCount = sentimentData.Sum(s => s.Count);
        
        return sentimentData.Select(s => new
        {
            sentiment = s.Sentiment,
            count = s.Count,
            percentage = totalCount > 0 ? Math.Round((double)s.Count / totalCount * 100, 1) : 0
        }).Cast<object>().ToList();
    }

    private async Task<List<object>> GetAllDoctors()
    {
        var doctors = await _context.Users
            .Where(u => u.Role == "Doctor" && u.IsActive)
            .Include(u => u.Hospital)
            .Include(u => u.PatientFeedbacks)
            .ToListAsync();

        var doctorList = doctors.Select(u => new
        {
            doctorId = u.Id,
            doctorName = u.Username,
            email = u.Email,
            hospitalName = u.Hospital != null ? u.Hospital.Name : "Unknown",
            averageTES = u.PatientFeedbacks.Any() ? 
                Math.Round(u.PatientFeedbacks.Average(pf => pf.TreatmentEvaluationScore), 1) : 0,
            feedbackCount = u.PatientFeedbacks.Count
        }).Cast<object>().ToList();

        return doctorList;
    }

    private async Task<List<object>> GetHospitalDoctors(Guid hospitalId)
    {
        var doctors = await _context.Users
            .Where(u => u.Role == "Doctor" && u.HospitalId == hospitalId && u.IsActive)
            .Include(u => u.Hospital)
            .Include(u => u.PatientFeedbacks)
            .ToListAsync();

        var doctorList = doctors.Select(u => new
        {
            doctorId = u.Id,
            doctorName = u.Username,
            email = u.Email,
            hospitalName = u.Hospital != null ? u.Hospital.Name : "Unknown",
            averageTES = u.PatientFeedbacks.Any() ? 
                Math.Round(u.PatientFeedbacks.Average(pf => pf.TreatmentEvaluationScore), 1) : 0,
            feedbackCount = u.PatientFeedbacks.Count
        }).Cast<object>().ToList();

        return doctorList;
    }

    private async Task<List<object>> GetAllPatients()
    {
        var patients = await _context.Patients
            .Where(p => p.IsActive)
            .Include(p => p.Hospital)
            .Select(p => new
            {
                p.Id,
                p.FirstName,
                p.LastName,
                p.PatientId,
                p.DateOfBirth,
                p.Gender,
                HospitalName = p.Hospital != null ? p.Hospital.Name : "Unknown",
                FeedbackCount = p.PatientFeedbacks.Count,
                LastFeedbackDate = p.PatientFeedbacks.Any() ? 
                    p.PatientFeedbacks.Max(pf => pf.CreatedAt) : (DateTime?)null
            })
            .ToListAsync();

        return patients.Select(p => new
        {
            patientId = p.Id,
            firstName = p.FirstName,
            lastName = p.LastName,
            patientIdNumber = p.PatientId,
            dateOfBirth = p.DateOfBirth,
            gender = p.Gender,
            hospitalName = p.HospitalName,
            feedbackCount = p.FeedbackCount,
            lastFeedbackDate = p.LastFeedbackDate
        }).Cast<object>().ToList();
    }

    private async Task<List<object>> GetHospitalPatients(Guid hospitalId)
    {
        var patients = await _context.Patients
            .Where(p => p.HospitalId == hospitalId && p.IsActive)
            .Include(p => p.Hospital)
            .Select(p => new
            {
                p.Id,
                p.FirstName,
                p.LastName,
                p.PatientId,
                p.DateOfBirth,
                p.Gender,
                HospitalName = p.Hospital != null ? p.Hospital.Name : "Unknown",
                FeedbackCount = p.PatientFeedbacks.Count,
                LastFeedbackDate = p.PatientFeedbacks.Any() ? 
                    p.PatientFeedbacks.Max(pf => pf.CreatedAt) : (DateTime?)null
            })
            .ToListAsync();

        return patients.Select(p => new
        {
            patientId = p.Id,
            firstName = p.FirstName,
            lastName = p.LastName,
            patientIdNumber = p.PatientId,
            dateOfBirth = p.DateOfBirth,
            gender = p.Gender,
            hospitalName = p.HospitalName,
            feedbackCount = p.FeedbackCount,
            lastFeedbackDate = p.LastFeedbackDate
        }).Cast<object>().ToList();
    }
}
