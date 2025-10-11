using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using SCIS.Core.Interfaces;

namespace SCIS.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly string _brevoApiKey;
    private readonly string _brevoApiUrl = "https://api.brevo.com/v3/smtp/email";

    public EmailService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _brevoApiKey = _configuration["Brevo:ApiKey"] ?? throw new InvalidOperationException("Brevo API Key not configured");
        
        _httpClient.DefaultRequestHeaders.Add("api-key", _brevoApiKey);
        _httpClient.DefaultRequestHeaders.Add("accept", "application/json");
    }

    public async Task<bool> SendPatientSignupEmailAsync(string patientEmail, string patientName, string patientId, string hospitalName)
    {
        try
        {
            var fromEmail = _configuration["Brevo:FromEmail"] ?? "noreply@scis.com";
            var fromName = _configuration["Brevo:FromName"] ?? "SCIS System";
            var frontendUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:3000";

            var emailContent = GeneratePatientSignupEmail(patientName, patientId, hospitalName, frontendUrl);

            var emailRequest = new
            {
                sender = new { email = fromEmail, name = fromName },
                to = new[] { new { email = patientEmail, name = patientName } },
                subject = "Complete Your Patient Registration - SCIS",
                htmlContent = emailContent,
                textContent = GeneratePatientSignupEmailText(patientName, patientId, hospitalName, frontendUrl)
            };

            var json = JsonSerializer.Serialize(emailRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(_brevoApiUrl, content);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            // Log the exception
            Console.WriteLine($"Error sending email: {ex.Message}");
            return false;
        }
    }

    private string GeneratePatientSignupEmail(string patientName, string patientId, string hospitalName, string frontendUrl)
    {
        var signupUrl = $"{frontendUrl}/patient-login?patientId={patientId}";
        
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Complete Your Patient Registration</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }}
        .button {{ display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
        .info-box {{ background-color: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Welcome to SCIS</h1>
            <p>Smart Care Information System</p>
        </div>
        <div class='content'>
            <h2>Hello {patientName}!</h2>
            <p>You have been registered as a patient at <strong>{hospitalName}</strong>. To complete your registration and access your patient portal, please set up your password using the details below:</p>
            
            <div class='info-box'>
                <h3>Your Patient Information:</h3>
                <p><strong>Patient ID:</strong> {patientId}</p>
                <p><strong>Hospital:</strong> {hospitalName}</p>
            </div>
            
            <p>Click the button below to complete your registration:</p>
            <a href='{signupUrl}' class='button' style='color:white'>Complete Registration</a>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style='word-break: break-all; color: #2563eb;'>{signupUrl}</p>
            
            <p><strong>Important:</strong> Please keep your Patient ID safe as you'll need it along with your password to access your account.</p>
        </div>
        <div class='footer'>
            <p>This is an automated message from the SCIS system. Please do not reply to this email.</p>
            <p>If you have any questions, please contact your hospital directly.</p>
        </div>
    </div>
</body>
</html>";
    }

    private string GeneratePatientSignupEmailText(string patientName, string patientId, string hospitalName, string frontendUrl)
    {
        var signupUrl = $"{frontendUrl}/patient-login?patientId={patientId}";
        
        return $@"
Welcome to SCIS - Smart Care Information System

Hello {patientName}!

You have been registered as a patient at {hospitalName}. To complete your registration and access your patient portal, please set up your password using the details below:

Your Patient Information:
- Patient ID: {patientId}
- Hospital: {hospitalName}

To complete your registration, visit: {signupUrl}

Important: Please keep your Patient ID safe as you'll need it along with your password to access your account.

This is an automated message from the SCIS system. Please do not reply to this email.
If you have any questions, please contact your hospital directly.
";
    }
}
