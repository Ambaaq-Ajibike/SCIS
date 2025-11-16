namespace SCIS.Core.Interfaces;

public interface IEmailService
{
    Task<bool> SendPatientSignupEmailAsync(string patientEmail, string patientName, string patientId, string hospitalName);
    Task<bool> SendDataRequestNotificationAsync(string hospitalEmail, string requestingHospitalName, string patientName, string patientId, string dataType, string purpose);
    Task<bool> SendDataRequestApprovalNotificationAsync(string requestingHospitalEmail, string patientHospitalName, string patientName, string patientId, bool isApproved);
    Task<bool> SendHospitalApprovalEmailAsync(string managerEmail, string managerName, string hospitalName, bool isApproved, string? notes = null);
}
