using SCIS.Core.DTOs;

namespace SCIS.Core.Interfaces;

public interface IDataRequestService
{
    Task<DataRequestResponseDto> RequestDataAsync(DataRequestDto request, Guid requestingUserId);
    Task<DataRequestResponseDto> ApproveDataRequestAsync(DataRequestApprovalDto approval, Guid approvingUserId);
    Task<List<PendingDataRequestDto>> GetPendingRequestsAsync(Guid hospitalId);
    Task<List<DataRequestResponseDto>> GetRequestHistoryAsync(Guid userId);
    Task<bool> ValidateConsentAsync(Guid patientId, Guid requestingUserId, string dataType);
    Task<bool> ValidateRoleAsync(Guid userId, string dataType);
    Task<string> FormatAsFHIRAsync(Guid patientId, string dataType);
    Task<string> CallPatientEndpointAsync(string patientId, string patientHospitalId, string dataType);
    Task LogDataRequestAsync(Guid requestId, bool success, int responseTimeMs, string? errorMessage = null);
}
