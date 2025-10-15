using Microsoft.EntityFrameworkCore;
using SCIS.Core.DTOs;
using SCIS.Core.Entities;
using SCIS.Core.Interfaces;
using SCIS.Infrastructure.Data;

namespace SCIS.Infrastructure.Services;

public class SystemManagerService(SCISDbContext _context) : ISystemManagerService
{
    public async Task<SystemManagerDashboardDto> GetSystemDashboardAsync()
    {
        var systemAnalytics = await GetSystemAnalyticsAsync();
        var hospitalAnalytics = await GetAllHospitalsAnalyticsAsync();
        var topDoctors = await GetTopPerformingDoctorsAsync();
        var recentDataRequests = await GetRecentDataRequestsAsync();
        var recentFeedbacks = await GetRecentFeedbacksAsync();

        return new SystemManagerDashboardDto
        {
            SystemAnalytics = systemAnalytics,
            HospitalAnalytics = hospitalAnalytics,
            TopPerformingDoctors = topDoctors,
            RecentDataRequests = recentDataRequests,
            RecentFeedbacks = recentFeedbacks
        };
    }

    public async Task<SystemAnalyticsDto> GetSystemAnalyticsAsync()
    {
        var totalHospitals = await _context.Hospitals.CountAsync();
        var activeHospitals = await _context.Hospitals.CountAsync(h => h.IsActive);
        var totalPatients = await _context.Patients.CountAsync();
        var activePatients = await _context.Patients.CountAsync(p => p.IsActive);
        var totalDataRequests = await _context.DataRequests.CountAsync();
        var totalDoctors = await _context.Users.CountAsync(u => u.Role == "Doctor");
        var totalStaff = await _context.Users.CountAsync(u => u.Role == "Staff");

        return new SystemAnalyticsDto
        {
            TotalHospitals = totalHospitals,
            TotalPatients = totalPatients,
            TotalDataRequests = totalDataRequests,
            TotalDoctors = totalDoctors,
            TotalStaff = totalStaff,
            ActiveHospitals = activeHospitals,
            ActivePatients = activePatients,
            LastUpdated = DateTime.UtcNow
        };
    }

    public async Task<List<HospitalAnalyticsDto>> GetAllHospitalsAnalyticsAsync()
    {
        var hospitals = await _context.Hospitals
            .Include(h => h.Users)
            .Include(h => h.Patients)
            .ToListAsync();

        var hospitalAnalytics = new List<HospitalAnalyticsDto>();

        foreach (var hospital in hospitals)
        {
            var dataRequests = await _context.DataRequests
                .Where(dr => dr.RequestingHospitalId == hospital.Id)
                .ToListAsync();

            var feedbacks = await _context.PatientFeedbacks
                .Include(pf => pf.Doctor)
                .Where(pf => pf.Doctor != null && pf.Doctor.HospitalId == hospital.Id)
                .ToListAsync();

            var analytics = new HospitalAnalyticsDto
            {
                HospitalId = hospital.Id,
                HospitalName = hospital.Name,
                Address = hospital.Address,
                PhoneNumber = hospital.PhoneNumber,
                Email = hospital.Email,
                IsActive = hospital.IsActive,
                CreatedAt = hospital.CreatedAt,
                TotalPatients = hospital.Patients.Count,
                TotalDoctors = hospital.Users.Count(u => u.Role == "Doctor"),
                TotalStaff = hospital.Users.Count(u => u.Role == "Staff"),
                TotalDataRequests = dataRequests.Count,
                PendingDataRequests = dataRequests.Count(dr => dr.Status == "Pending"),
                ApprovedDataRequests = dataRequests.Count(dr => dr.Status == "Approved"),
                DeniedDataRequests = dataRequests.Count(dr => dr.Status == "Denied"),
                AverageResponseTimeMs = dataRequests.Any() ? dataRequests.Average(dr => dr.ResponseTimeMs) : 0,
                AverageTreatmentEvaluationScore = feedbacks.Any() ? feedbacks.Average(f => f.TreatmentEvaluationScore) : 0,
                TotalFeedbacks = feedbacks.Count
            };

            hospitalAnalytics.Add(analytics);
        }

        return hospitalAnalytics;
    }

    public async Task<HospitalDetailDto> GetHospitalDetailAsync(Guid hospitalId)
    {
        var hospital = await _context.Hospitals
            .Include(h => h.Users)
            .Include(h => h.Patients)
            .FirstOrDefaultAsync(h => h.Id == hospitalId);

        if (hospital == null)
            throw new ArgumentException("Hospital not found");

        var hospitalAnalytics = (await GetAllHospitalsAnalyticsAsync())
            .FirstOrDefault(ha => ha.HospitalId == hospitalId);

        var doctors = await GetDoctorsByHospitalAsync(hospitalId);
        var patients = await GetPatientsByHospitalAsync(hospitalId);
        var dataRequests = await GetDataRequestsByHospitalAsync(hospitalId);
        var feedbacks = await GetFeedbacksByHospitalAsync(hospitalId);

        return new HospitalDetailDto
        {
            HospitalInfo = hospitalAnalytics ?? new HospitalAnalyticsDto(),
            Doctors = doctors,
            Patients = patients,
            DataRequests = dataRequests,
            Feedbacks = feedbacks
        };
    }

    public async Task<List<DoctorPerformanceDto>> GetDoctorsByHospitalAsync(Guid hospitalId)
    {
        var doctors = await _context.Users
            .Where(u => u.Role == "Doctor" && u.HospitalId == hospitalId)
            .Include(u => u.Hospital)
            .ToListAsync();

        var doctorPerformance = new List<DoctorPerformanceDto>();

        foreach (var doctor in doctors)
        {
            var dataRequests = await _context.DataRequests
                .Where(dr => dr.RequestingUserId == doctor.Id)
                .ToListAsync();

            var feedbacks = await _context.PatientFeedbacks
                .Where(pf => pf.DoctorId == doctor.Id)
                .ToListAsync();

            var patients = await _context.Patients
                .Where(p => p.HospitalId == hospitalId)
                .CountAsync();

            var performance = new DoctorPerformanceDto
            {
                DoctorId = doctor.Id,
                DoctorName = doctor.Username,
                Email = doctor.Email,
                Specialty = "General", // This would need to be added to the User entity
                HospitalId = hospitalId,
                HospitalName = doctor.Hospital?.Name ?? "",
                IsActive = doctor.IsActive,
                TotalPatients = patients,
                TotalDataRequests = dataRequests.Count,
                TotalFeedbacks = feedbacks.Count,
                AverageTreatmentEvaluationScore = feedbacks.Any() ? feedbacks.Average(f => f.TreatmentEvaluationScore) : 0,
                AverageSentimentScore = feedbacks.Any() ? feedbacks.Average(f => f.SentimentScore) : 0,
                LastActivity = doctor.LastLoginAt ?? doctor.CreatedAt
            };

            doctorPerformance.Add(performance);
        }

        return doctorPerformance;
    }

    public async Task<List<DoctorPerformanceDto>> GetAllDoctorsPerformanceAsync()
    {
        var doctors = await _context.Users
            .Where(u => u.Role == "Doctor")
            .Include(u => u.Hospital)
            .ToListAsync();

        var doctorPerformance = new List<DoctorPerformanceDto>();

        foreach (var doctor in doctors)
        {
            var dataRequests = await _context.DataRequests
                .Where(dr => dr.RequestingUserId == doctor.Id)
                .ToListAsync();

            var feedbacks = await _context.PatientFeedbacks
                .Where(pf => pf.DoctorId == doctor.Id)
                .ToListAsync();

            var patients = await _context.Patients
                .Where(p => p.HospitalId == doctor.HospitalId)
                .CountAsync();

            var performance = new DoctorPerformanceDto
            {
                DoctorId = doctor.Id,
                DoctorName = doctor.Username,
                Email = doctor.Email,
                Specialty = "General", // This would need to be added to the User entity
                HospitalId = doctor.HospitalId ?? Guid.Empty,
                HospitalName = doctor.Hospital?.Name ?? "",
                IsActive = doctor.IsActive,
                TotalPatients = patients,
                TotalDataRequests = dataRequests.Count,
                TotalFeedbacks = feedbacks.Count,
                AverageTreatmentEvaluationScore = feedbacks.Any() ? feedbacks.Average(f => f.TreatmentEvaluationScore) : 0,
                AverageSentimentScore = feedbacks.Any() ? feedbacks.Average(f => f.SentimentScore) : 0,
                LastActivity = doctor.LastLoginAt ?? doctor.CreatedAt
            };

            doctorPerformance.Add(performance);
        }

        return doctorPerformance;
    }

    public async Task<List<DataRequestResponseDto>> GetAllDataRequestsAsync()
    {
        var dataRequests = await _context.DataRequests
            .Include(dr => dr.RequestingUser)
            .Include(dr => dr.Patient)
            .Include(dr => dr.ApprovingUser)
            .OrderByDescending(dr => dr.RequestDate)
            .ToListAsync();

        return dataRequests.Select(MapToDataRequestResponse).ToList();
    }

    public async Task<List<DataRequestResponseDto>> GetDataRequestsByHospitalAsync(Guid hospitalId)
    {
        var dataRequests = await _context.DataRequests
            .Include(dr => dr.RequestingUser)
            .Include(dr => dr.Patient)
            .Include(dr => dr.ApprovingUser)
            .Where(dr => dr.RequestingHospitalId == hospitalId)
            .OrderByDescending(dr => dr.RequestDate)
            .ToListAsync();

        return dataRequests.Select(MapToDataRequestResponse).ToList();
    }

    public async Task<List<PatientFeedbackResponseDto>> GetAllFeedbacksAsync()
    {
        var feedbacks = await _context.PatientFeedbacks
            .Include(pf => pf.Doctor)
            .OrderByDescending(pf => pf.CreatedAt)
            .ToListAsync();

        return feedbacks.Select(MapToPatientFeedbackResponse).ToList();
    }

    public async Task<List<PatientFeedbackResponseDto>> GetFeedbacksByHospitalAsync(Guid hospitalId)
    {
        var feedbacks = await _context.PatientFeedbacks
            .Include(pf => pf.Doctor)
            .Where(pf => pf.Doctor != null && pf.Doctor.HospitalId == hospitalId)
            .OrderByDescending(pf => pf.CreatedAt)
            .ToListAsync();

        return feedbacks.Select(MapToPatientFeedbackResponse).ToList();
    }

    private async Task<List<DoctorPerformanceDto>> GetTopPerformingDoctorsAsync(int count = 10)
    {
        var allDoctors = await GetAllDoctorsPerformanceAsync();
        return allDoctors
            .OrderByDescending(d => d.AverageTreatmentEvaluationScore)
            .Take(count)
            .ToList();
    }

    private async Task<List<DataRequestResponseDto>> GetRecentDataRequestsAsync(int count = 10)
    {
        var allRequests = await GetAllDataRequestsAsync();
        return allRequests.Take(count).ToList();
    }

    private async Task<List<PatientFeedbackResponseDto>> GetRecentFeedbacksAsync(int count = 10)
    {
        var allFeedbacks = await GetAllFeedbacksAsync();
        return allFeedbacks.Take(count).ToList();
    }

    private async Task<List<PatientDto>> GetPatientsByHospitalAsync(Guid hospitalId)
    {
        var patients = await _context.Patients
            .Include(p => p.Hospital)
            .Where(p => p.HospitalId == hospitalId)
            .ToListAsync();

        return patients.Select(p => new PatientDto
        {
            Id = p.Id.ToString(),
            FirstName = p.FirstName,
            LastName = p.LastName,
            PatientId = p.PatientId,
            DateOfBirth = p.DateOfBirth,
            Gender = p.Gender,
            PhoneNumber = p.PhoneNumber,
            Email = p.Email,
            HospitalId = p.HospitalId.ToString(),
            HospitalName = p.Hospital?.Name ?? "",
            IsActive = p.IsActive,
            IsSignupCompleted = p.IsSignupCompleted,
            CreatedAt = p.CreatedAt
        }).ToList();
    }

    private static DataRequestResponseDto MapToDataRequestResponse(DataRequest dr)
    {
        return new DataRequestResponseDto
        {
            Id = dr.Id,
            Status = dr.Status,
            ResponseData = dr.ResponseData,
            DenialReason = dr.DenialReason,
            RequestDate = dr.RequestDate,
            ResponseDate = dr.ResponseDate,
            ApprovalDate = dr.ApprovalDate,
            ResponseTimeMs = dr.ResponseTimeMs,
            IsConsentValid = dr.IsConsentValid,
            IsRoleAuthorized = dr.IsRoleAuthorized,
            IsCrossHospitalRequest = dr.IsCrossHospitalRequest,
            RequestingHospitalName = dr.RequestingUser?.Hospital?.Name,
            PatientHospitalName = dr.Patient?.Hospital?.Name,
            PatientName = dr.Patient != null ? $"{dr.Patient.FirstName} {dr.Patient.LastName}" : null,
            PatientId = dr.Patient?.PatientId,
            ApprovingUserName = dr.ApprovingUser?.Username
        };
    }

    private static PatientFeedbackResponseDto MapToPatientFeedbackResponse(PatientFeedback pf)
    {
        return new PatientFeedbackResponseDto
        {
            Id = pf.Id,
            TreatmentEvaluationScore = pf.TreatmentEvaluationScore,
            SentimentAnalysis = pf.SentimentAnalysis,
            SentimentScore = pf.SentimentScore,
            CreatedAt = pf.CreatedAt
        };
    }
}
