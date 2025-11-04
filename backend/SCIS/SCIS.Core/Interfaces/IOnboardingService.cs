using SCIS.Core.DTOs;

namespace SCIS.Core.Interfaces;

public interface IOnboardingService
{
    Task<LoginResponse> RegisterHospitalAsync(RegisterHospitalDto dto);
    Task<DoctorDto> CreateDoctorAsync(CreateDoctorDto dto, Guid hospitalId);
    Task<bool> ApproveHospitalAsync(Guid hospitalId, bool isApproved, Guid approvedByUserId, string? notes = null);
    Task<List<HospitalDto>> GetPendingHospitalsAsync();
    Task<HospitalDto?> GetHospitalByIdAsync(Guid hospitalId);
}

