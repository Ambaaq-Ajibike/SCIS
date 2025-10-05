using SCIS.Core.DTOs;

namespace SCIS.Core.Interfaces;

public interface IDataRequestService
{
    Task<DataRequestResponseDto> RequestDataAsync(DataRequestDto request, Guid requestingUserId);
    Task<bool> ValidateConsentAsync(Guid patientId, Guid requestingUserId, string dataType);
    Task<bool> ValidateRoleAsync(Guid userId, string dataType);
    Task<string> FormatAsFHIRAsync(Guid patientId, string dataType);
    Task LogDataRequestAsync(Guid requestId, bool success, int responseTimeMs, string? errorMessage = null);
}
