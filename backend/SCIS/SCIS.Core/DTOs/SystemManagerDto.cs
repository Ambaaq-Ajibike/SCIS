namespace SCIS.Core.DTOs;

public class SystemAnalyticsDto
{
    public int TotalHospitals { get; set; }
    public int TotalPatients { get; set; }
    public int TotalDataRequests { get; set; }
    public int TotalDoctors { get; set; }
    public int TotalStaff { get; set; }
    public int ActiveHospitals { get; set; }
    public int ActivePatients { get; set; }
    public DateTime LastUpdated { get; set; }
}

public class HospitalAnalyticsDto
{
    public Guid HospitalId { get; set; }
    public string HospitalName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public int TotalPatients { get; set; }
    public int TotalDoctors { get; set; }
    public int TotalStaff { get; set; }
    public int TotalDataRequests { get; set; }
    public int PendingDataRequests { get; set; }
    public int ApprovedDataRequests { get; set; }
    public int DeniedDataRequests { get; set; }
    public double AverageResponseTimeMs { get; set; }
    public double AverageTreatmentEvaluationScore { get; set; }
    public int TotalFeedbacks { get; set; }
}

public class DoctorPerformanceDto
{
    public Guid DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public Guid HospitalId { get; set; }
    public string HospitalName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int TotalPatients { get; set; }
    public int TotalDataRequests { get; set; }
    public int TotalFeedbacks { get; set; }
    public double AverageTreatmentEvaluationScore { get; set; }
    public double AverageSentimentScore { get; set; }
    public DateTime LastActivity { get; set; }
}

public class SystemManagerDashboardDto
{
    public SystemAnalyticsDto SystemAnalytics { get; set; } = null!;
    public List<HospitalAnalyticsDto> HospitalAnalytics { get; set; } = new();
    public List<DoctorPerformanceDto> TopPerformingDoctors { get; set; } = new();
    public List<DataRequestResponseDto> RecentDataRequests { get; set; } = new();
    public List<PatientFeedbackResponseDto> RecentFeedbacks { get; set; } = new();
}

public class HospitalDetailDto
{
    public HospitalAnalyticsDto HospitalInfo { get; set; } = null!;
    public List<DoctorPerformanceDto> Doctors { get; set; } = new();
    public List<PatientDto> Patients { get; set; } = new();
    public List<DataRequestResponseDto> DataRequests { get; set; } = new();
    public List<PatientFeedbackResponseDto> Feedbacks { get; set; } = new();
}
