using SCIS.Core.DTOs;

namespace SCIS.Core.Interfaces;

public interface IDataRequestService
{
    Task<DataRequestResponseDto> RequestDataAsync(DataRequestDto request, int requestingUserId);
    Task<bool> ValidateConsentAsync(int patientId, int requestingUserId, string dataType);
    Task<bool> ValidateRoleAsync(int userId, string dataType);
    Task<string> FormatAsFHIRAsync(int patientId, string dataType);
    Task LogDataRequestAsync(int requestId, bool success, int responseTimeMs, string? errorMessage = null);
}
