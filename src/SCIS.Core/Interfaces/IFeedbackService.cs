using SCIS.Core.DTOs;

namespace SCIS.Core.Interfaces;

public interface IFeedbackService
{
    Task<PatientFeedbackResponseDto> SubmitFeedbackAsync(PatientFeedbackDto feedback);
    Task<double> CalculateTESAsync(int preTreatment, int postTreatment, int satisfaction, string? textFeedback);
    Task<string> AnalyzeSentimentAsync(string text);
    Task<double> GetDoctorAverageTESAsync(int doctorId);
    Task<double> GetHospitalAverageTESAsync(int hospitalId);
    Task<List<object>> GetPerformanceInsightsAsync();
}
