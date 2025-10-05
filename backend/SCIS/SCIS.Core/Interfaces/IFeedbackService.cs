using SCIS.Core.DTOs;

namespace SCIS.Core.Interfaces;

public interface IFeedbackService
{
    Task<PatientFeedbackResponseDto> SubmitFeedbackAsync(PatientFeedbackDto feedback);
    Task<double> CalculateTESAsync(int preTreatment, int postTreatment, int satisfaction, string? textFeedback);
    Task<string> AnalyzeSentimentAsync(string text);
    Task<double> GetDoctorAverageTESAsync(Guid doctorId);
    Task<double> GetHospitalAverageTESAsync(Guid hospitalId);
    Task<List<object>> GetPerformanceInsightsAsync();
}
