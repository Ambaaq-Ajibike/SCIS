using Microsoft.EntityFrameworkCore;
using SCIS.Core.DTOs;
using SCIS.Core.Entities;
using SCIS.Core.Interfaces;
using SCIS.Infrastructure.Data;
using SCIS.ML.Services;

namespace SCIS.Infrastructure.Services;

public class FeedbackService(SCISDbContext _context, IMLService _mlService) : IFeedbackService
{

    public async Task<PatientFeedbackResponseDto> SubmitFeedbackAsync(PatientFeedbackDto feedback)
    {
        // Calculate TES
        var tes = await CalculateTESAsync(
            feedback.PreTreatmentRating, 
            feedback.PostTreatmentRating, 
            feedback.SatisfactionRating, 
            feedback.TextFeedback);

        // Analyze sentiment
        var sentiment = await AnalyzeSentimentAsync(feedback.TextFeedback ?? "");
        var sentimentScore = await CalculateSentimentScoreAsync(feedback.TextFeedback ?? "");

        var patientFeedback = new PatientFeedback
        {
            PatientId = feedback.PatientId,
            DoctorId = feedback.DoctorId,
            HospitalId = await GetHospitalIdFromDoctorAsync(feedback.DoctorId),
            TreatmentDescription = feedback.TreatmentDescription,
            PreTreatmentRating = feedback.PreTreatmentRating,
            PostTreatmentRating = feedback.PostTreatmentRating,
            SatisfactionRating = feedback.SatisfactionRating,
            TextFeedback = feedback.TextFeedback,
            TreatmentEvaluationScore = tes,
            SentimentAnalysis = sentiment,
            SentimentScore = sentimentScore,
            CreatedAt = DateTime.UtcNow,
            IsProcessed = true
        };

        _context.PatientFeedbacks.Add(patientFeedback);
        await _context.SaveChangesAsync();

        // Update hospital average TES
        await UpdateHospitalAverageTESAsync(patientFeedback.HospitalId);

        return new PatientFeedbackResponseDto
        {
            Id = patientFeedback.Id,
            TreatmentEvaluationScore = tes,
            SentimentAnalysis = sentiment,
            SentimentScore = sentimentScore,
            CreatedAt = patientFeedback.CreatedAt
        };
    }

    public async Task<double> CalculateTESAsync(int preTreatment, int postTreatment, int satisfaction, string? textFeedback)
    {
        // Normalize inputs to [0,1] range
        var normalizedPre = (preTreatment - 1) / 4.0; // Convert 1-5 to 0-1
        var normalizedPost = (postTreatment - 1) / 4.0;
        var normalizedSatisfaction = (satisfaction - 1) / 4.0;
        
        // Text feedback sentiment bonus (0-0.1)
        var textBonus = 0.0;
        if (!string.IsNullOrWhiteSpace(textFeedback))
        {
            var sentiment = await AnalyzeSentimentAsync(textFeedback);
            textBonus = sentiment == "Positive" ? 0.1 : sentiment == "Neutral" ? 0.05 : 0.0;
        }

        // Apply weights: [0.1, 0.3, 0.3, 0.3] for [pre, post, satisfaction, text]
        var tes = (normalizedPre * 0.1) + (normalizedPost * 0.3) + (normalizedSatisfaction * 0.3) + (textBonus * 0.3);
        
        // Convert to percentage
        return Math.Min(100.0, tes * 100);
    }

    public async Task<string> AnalyzeSentimentAsync(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return "Neutral";

        return await _mlService.AnalyzeSentimentAsync(text);
    }

    public async Task<double> GetDoctorAverageTESAsync(Guid doctorId)
    {
        var average = await _context.PatientFeedbacks
            .Where(f => f.DoctorId == doctorId && f.IsProcessed)
            .AverageAsync(f => f.TreatmentEvaluationScore);

        return average;
    }

    public async Task<double> GetHospitalAverageTESAsync(Guid hospitalId)
    {
        var average = await _context.PatientFeedbacks
            .Where(f => f.HospitalId == hospitalId && f.IsProcessed)
            .AverageAsync(f => f.TreatmentEvaluationScore);

        return average;
    }

    public async Task<List<object>> GetPerformanceInsightsAsync()
    {
        var insights = new List<object>();

        // Get doctors below threshold
        var doctorsBelowThreshold = await _context.Users
            .Where(u => u.Role == "Doctor")
            .Select(d => new
            {
                DoctorId = d.Id,
                DoctorName = d.Username,
                HospitalId = d.HospitalId,
                HospitalName = d.Hospital!.Name,
                AverageTES = _context.PatientFeedbacks
                    .Where(f => f.DoctorId == d.Id && f.IsProcessed)
                    .Average(f => f.TreatmentEvaluationScore)
            })
            .Where(d => d.AverageTES < 70.0)
            .ToListAsync();

        insights.AddRange(doctorsBelowThreshold.Select(d => new
        {
            Type = "DoctorBelowThreshold",
            DoctorId = d.DoctorId,
            DoctorName = d.DoctorName,
            HospitalId = d.HospitalId,
            HospitalName = d.HospitalName,
            AverageTES = d.AverageTES,
            Severity = d.AverageTES < 50 ? "Critical" : "Warning"
        }));

        // Get hospital performance
        var hospitalPerformance = await _context.Hospitals
            .Select(h => new
            {
                HospitalId = h.Id,
                HospitalName = h.Name,
                AverageTES = h.AverageTES,
                PatientVolume = h.PatientVolume,
                PerformanceIndex = h.PerformanceIndex
            })
            .OrderByDescending(h => h.PerformanceIndex)
            .ToListAsync();

        insights.AddRange(hospitalPerformance.Select(h => new
        {
            Type = "HospitalPerformance",
            HospitalId = h.HospitalId,
            HospitalName = h.HospitalName,
            AverageTES = h.AverageTES,
            PatientVolume = h.PatientVolume,
            PerformanceIndex = h.PerformanceIndex,
            Ranking = hospitalPerformance.IndexOf(h) + 1
        }));

        // Get sentiment distribution
        var sentimentDistribution = await _context.PatientFeedbacks
            .Where(f => f.IsProcessed && !string.IsNullOrEmpty(f.SentimentAnalysis))
            .GroupBy(f => f.SentimentAnalysis)
            .Select(g => new
            {
                Sentiment = g.Key,
                Count = g.Count(),
                Percentage = (double)g.Count() / _context.PatientFeedbacks.Count(f => f.IsProcessed) * 100
            })
            .ToListAsync();

        insights.AddRange(sentimentDistribution.Select(s => new
        {
            Type = "SentimentDistribution",
            Sentiment = s.Sentiment,
            Count = s.Count,
            Percentage = s.Percentage
        }));

        return insights;
    }

    public async Task<List<object>> GetDoctorsByHospitalAsync(Guid hospitalId)
    {
        var doctors = await _context.Users
            .Where(u => u.Role == "Doctor" && u.HospitalId == hospitalId && u.IsActive)
            .Include(u => u.Hospital)
            .ToListAsync();

        var result = doctors.Select(d => new
        {
            Id = d.Id.ToString(),
            FirstName = ExtractFirstName(d.Username),
            LastName = ExtractLastName(d.Username),
            Email = d.Email,
            Specialty = "General Medicine", // You might want to add specialty to User entity
            HospitalId = d.HospitalId?.ToString() ?? "",
            HospitalName = d.Hospital?.Name ?? "Unknown Hospital",
            IsActive = d.IsActive
        }).Cast<object>().ToList();

        return result;
    }

    private static string ExtractFirstName(string username)
    {
        if (string.IsNullOrEmpty(username))
            return "";

        // Handle doctor usernames like "dr_sarah_johnson"
        if (username.StartsWith("dr_"))
        {
            var parts = username.Substring(3).Split('_'); // Remove "dr_" prefix
            return parts.Length > 0 ? CapitalizeFirst(parts[0]) : "";
        }

        // Handle regular usernames with spaces
        if (username.Contains(' '))
        {
            return CapitalizeFirst(username.Split(' ')[0]);
        }

        // Single word username
        return CapitalizeFirst(username);
    }

    private static string ExtractLastName(string username)
    {
        if (string.IsNullOrEmpty(username))
            return "";

        // Handle doctor usernames like "dr_sarah_johnson"
        if (username.StartsWith("dr_"))
        {
            var parts = username.Substring(3).Split('_'); // Remove "dr_" prefix
            if (parts.Length > 1)
            {
                return CapitalizeFirst(string.Join(" ", parts.Skip(1)));
            }
            return "";
        }

        // Handle regular usernames with spaces
        if (username.Contains(' '))
        {
            var parts = username.Split(' ');
            if (parts.Length > 1)
            {
                return CapitalizeFirst(string.Join(" ", parts.Skip(1)));
            }
        }

        return "";
    }

    private static string CapitalizeFirst(string text)
    {
        if (string.IsNullOrEmpty(text))
            return "";
        
        return char.ToUpper(text[0]) + text.Substring(1).ToLower();
    }

    private async Task<Guid> GetHospitalIdFromDoctorAsync(Guid doctorId)
    {
        var doctor = await _context.Users.FindAsync(doctorId);
        return doctor?.HospitalId ?? Guid.Empty;
    }

    private async Task UpdateHospitalAverageTESAsync(Guid hospitalId)
    {
        var averageTES = await _context.PatientFeedbacks
            .Where(f => f.HospitalId == hospitalId && f.IsProcessed)
            .AverageAsync(f => f.TreatmentEvaluationScore);

        var hospital = await _context.Hospitals.FindAsync(hospitalId);
        if (hospital != null)
        {
            hospital.AverageTES = averageTES;
            await _context.SaveChangesAsync();
        }
    }

    private async Task<double> CalculateSentimentScoreAsync(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return 0.0;

        // Simple sentiment scoring based on keywords
        var positiveWords = new[] { "excellent", "great", "good", "amazing", "wonderful", "fantastic", "outstanding" };
        var negativeWords = new[] { "terrible", "awful", "bad", "poor", "disappointed", "horrible", "worst" };

        var words = text.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var positiveCount = words.Count(w => positiveWords.Contains(w));
        var negativeCount = words.Count(w => negativeWords.Contains(w));

        if (positiveCount + negativeCount == 0)
            return 0.0;

        return (positiveCount - negativeCount) / (double)(positiveCount + negativeCount);
    }
}
