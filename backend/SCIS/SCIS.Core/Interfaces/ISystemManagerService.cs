using SCIS.Core.DTOs;

namespace SCIS.Core.Interfaces;

public interface ISystemManagerService
{
    Task<SystemManagerDashboardDto> GetSystemDashboardAsync();
    Task<SystemAnalyticsDto> GetSystemAnalyticsAsync();
    Task<List<HospitalAnalyticsDto>> GetAllHospitalsAnalyticsAsync();
    Task<HospitalDetailDto> GetHospitalDetailAsync(Guid hospitalId);
    Task<List<DoctorPerformanceDto>> GetDoctorsByHospitalAsync(Guid hospitalId);
    Task<List<DoctorPerformanceDto>> GetAllDoctorsPerformanceAsync();
    Task<List<DataRequestResponseDto>> GetAllDataRequestsAsync();
    Task<List<DataRequestResponseDto>> GetDataRequestsByHospitalAsync(Guid hospitalId);
    Task<List<PatientFeedbackResponseDto>> GetAllFeedbacksAsync();
    Task<List<PatientFeedbackResponseDto>> GetFeedbacksByHospitalAsync(Guid hospitalId);
}
