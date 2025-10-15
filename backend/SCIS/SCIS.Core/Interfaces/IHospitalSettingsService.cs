using SCIS.Core.DTOs;

namespace SCIS.Core.Interfaces;

public interface IHospitalSettingsService
{
    Task<HospitalSettingsDto?> GetHospitalSettingsAsync(Guid hospitalId);
    Task<HospitalSettingsDto> CreateHospitalSettingsAsync(CreateHospitalSettingsDto dto);
    Task<HospitalSettingsDto> UpdateHospitalSettingsAsync(Guid hospitalId, UpdateHospitalSettingsDto dto);
    Task<bool> DeleteHospitalSettingsAsync(Guid hospitalId);
        Task<EndpointValidationDto> ValidateEndpointAsync(string endpointUrl, string endpointType);
    Task<HospitalSettingsDto> ValidateAllEndpointsAsync(Guid hospitalId);
    Task<List<EndpointValidationDto>> ValidateSpecificEndpointsAsync(Guid hospitalId, List<string> endpointTypes);
}
