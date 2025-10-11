namespace SCIS.Core.Interfaces;

public interface IEmailService
{
    Task<bool> SendPatientSignupEmailAsync(string patientEmail, string patientName, string patientId, string hospitalName);
}
