using Microsoft.EntityFrameworkCore;
using SCIS.Core.Entities;

namespace SCIS.Infrastructure.Data;

public static class SeedData
{
    public static async Task SeedAsync(SCISDbContext context)
    {
        // Ensure database is created
        await context.Database.EnsureCreatedAsync();

        // Check if data already exists
        if (await context.Hospitals.AnyAsync())
            return;

        // Create hospitals
        var hospitals = new List<Hospital>
        {
            new() { Name = "City General Hospital", Address = "123 Main St, City", PhoneNumber = "555-0101", Email = "info@citygeneral.com", LicenseNumber = "HOSP001" },
            new() { Name = "Metro Medical Center", Address = "456 Health Ave, Metro", PhoneNumber = "555-0102", Email = "contact@metromedical.com", LicenseNumber = "HOSP002" },
            new() { Name = "Regional Health Center", Address = "789 Care Blvd, Region", PhoneNumber = "555-0103", Email = "admin@regionalhealth.com", LicenseNumber = "HOSP003" },
            new() { Name = "Community Hospital", Address = "321 Wellness St, Community", PhoneNumber = "555-0104", Email = "support@communityhospital.com", LicenseNumber = "HOSP004" },
            new() { Name = "University Medical Center", Address = "654 Academic Way, University", PhoneNumber = "555-0105", Email = "info@universitymedical.com", LicenseNumber = "HOSP005" }
        };

        context.Hospitals.AddRange(hospitals);
        await context.SaveChangesAsync();

        // Create users
        var users = new List<User>
        {
            // Hospital Managers
            new() { Username = "manager1", Email = "manager1@citygeneral.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "HospitalManager", HospitalId = 1 },
            new() { Username = "manager2", Email = "manager2@metromedical.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "HospitalManager", HospitalId = 2 },
            new() { Username = "manager3", Email = "manager3@regionalhealth.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "HospitalManager", HospitalId = 3 },
            new() { Username = "manager4", Email = "manager4@communityhospital.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "HospitalManager", HospitalId = 4 },
            new() { Username = "manager5", Email = "manager5@universitymedical.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "HospitalManager", HospitalId = 5 },

            // Doctors
            new() { Username = "dr_sarah_johnson", Email = "sarah.johnson@citygeneral.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Doctor", HospitalId = 1 },
            new() { Username = "dr_michael_chen", Email = "michael.chen@metromedical.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Doctor", HospitalId = 2 },
            new() { Username = "dr_emily_davis", Email = "emily.davis@regionalhealth.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Doctor", HospitalId = 3 },
            new() { Username = "dr_robert_wilson", Email = "robert.wilson@communityhospital.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Doctor", HospitalId = 4 },
            new() { Username = "dr_lisa_brown", Email = "lisa.brown@universitymedical.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Doctor", HospitalId = 5 },

            // Staff
            new() { Username = "staff1", Email = "staff1@citygeneral.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Staff", HospitalId = 1 },
            new() { Username = "staff2", Email = "staff2@metromedical.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Staff", HospitalId = 2 },
            new() { Username = "staff3", Email = "staff3@regionalhealth.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Staff", HospitalId = 3 },

            // Demo patient
            new() { Username = "patient_demo", Email = "patient@demo.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Patient", HospitalId = 1 }
        };

        context.Users.AddRange(users);
        await context.SaveChangesAsync();

        // Create patients
        var patients = new List<Patient>
        {
            new() { FirstName = "John", LastName = "Doe", PatientId = "PAT001", DateOfBirth = DateTime.SpecifyKind(new DateTime(1985, 5, 15), DateTimeKind.Utc), Gender = "Male", PhoneNumber = "555-1001", Email = "john.doe@email.com", HospitalId = 1, BiometricConsent = true, BiometricConsentDate = DateTime.UtcNow.AddDays(-30) },
            new() { FirstName = "Jane", LastName = "Smith", PatientId = "PAT002", DateOfBirth = DateTime.SpecifyKind(new DateTime(1990, 8, 22), DateTimeKind.Utc), Gender = "Female", PhoneNumber = "555-1002", Email = "jane.smith@email.com", HospitalId = 2, BiometricConsent = true, BiometricConsentDate = DateTime.UtcNow.AddDays(-15) },
            new() { FirstName = "Mike", LastName = "Johnson", PatientId = "PAT003", DateOfBirth = DateTime.SpecifyKind(new DateTime(1978, 12, 3), DateTimeKind.Utc), Gender = "Male", PhoneNumber = "555-1003", Email = "mike.johnson@email.com", HospitalId = 3, BiometricConsent = true, BiometricConsentDate = DateTime.UtcNow.AddDays(-7) },
            new() { FirstName = "Sarah", LastName = "Williams", PatientId = "PAT004", DateOfBirth = DateTime.SpecifyKind(new DateTime(1992, 3, 18), DateTimeKind.Utc), Gender = "Female", PhoneNumber = "555-1004", Email = "sarah.williams@email.com", HospitalId = 4, BiometricConsent = true, BiometricConsentDate = DateTime.UtcNow.AddDays(-20) },
            new() { FirstName = "David", LastName = "Brown", PatientId = "PAT005", DateOfBirth = DateTime.SpecifyKind(new DateTime(1988, 7, 9), DateTimeKind.Utc), Gender = "Male", PhoneNumber = "555-1005", Email = "david.brown@email.com", HospitalId = 5, BiometricConsent = true, BiometricConsentDate = DateTime.UtcNow.AddDays(-10) }
        };

        context.Patients.AddRange(patients);
        await context.SaveChangesAsync();

        // Create patient consents
        var consents = new List<PatientConsent>
        {
            new() { PatientId = 1, RequestingUserId = 6, RequestingHospitalId = 1, DataType = "LabResults", Purpose = "Treatment planning", IsConsented = true, ConsentDate = DateTime.UtcNow.AddDays(-30), ExpiryDate = DateTime.UtcNow.AddDays(30) },
            new() { PatientId = 1, RequestingUserId = 6, RequestingHospitalId = 1, DataType = "MedicalHistory", Purpose = "Comprehensive care", IsConsented = true, ConsentDate = DateTime.UtcNow.AddDays(-30), ExpiryDate = DateTime.UtcNow.AddDays(30) },
            new() { PatientId = 2, RequestingUserId = 7, RequestingHospitalId = 2, DataType = "LabResults", Purpose = "Diagnosis", IsConsented = true, ConsentDate = DateTime.UtcNow.AddDays(-15), ExpiryDate = DateTime.UtcNow.AddDays(15) },
            new() { PatientId = 3, RequestingUserId = 8, RequestingHospitalId = 3, DataType = "TreatmentRecords", Purpose = "Follow-up care", IsConsented = true, ConsentDate = DateTime.UtcNow.AddDays(-7), ExpiryDate = DateTime.UtcNow.AddDays(23) }
        };

        context.PatientConsents.AddRange(consents);
        await context.SaveChangesAsync();

        // Create sample patient feedback
        var feedbacks = new List<PatientFeedback>
        {
            new() { PatientId = 1, DoctorId = 6, HospitalId = 1, TreatmentDescription = "Cardiac consultation and treatment", PreTreatmentRating = 2, PostTreatmentRating = 5, SatisfactionRating = 5, TextFeedback = "Excellent care, very professional and caring staff", TreatmentEvaluationScore = 92.5, SentimentAnalysis = "Positive", SentimentScore = 0.8, CreatedAt = DateTime.UtcNow.AddDays(-5), IsProcessed = true },
            new() { PatientId = 2, DoctorId = 7, HospitalId = 2, TreatmentDescription = "Neurological examination", PreTreatmentRating = 3, PostTreatmentRating = 4, SatisfactionRating = 4, TextFeedback = "Good treatment, but waiting time was long", TreatmentEvaluationScore = 78.3, SentimentAnalysis = "Neutral", SentimentScore = 0.2, CreatedAt = DateTime.UtcNow.AddDays(-3), IsProcessed = true },
            new() { PatientId = 3, DoctorId = 8, HospitalId = 3, TreatmentDescription = "Pediatric checkup", PreTreatmentRating = 1, PostTreatmentRating = 5, SatisfactionRating = 5, TextFeedback = "Amazing doctor, very patient with children", TreatmentEvaluationScore = 95.0, SentimentAnalysis = "Positive", SentimentScore = 0.9, CreatedAt = DateTime.UtcNow.AddDays(-1), IsProcessed = true },
            new() { PatientId = 4, DoctorId = 9, HospitalId = 4, TreatmentDescription = "Orthopedic consultation", PreTreatmentRating = 4, PostTreatmentRating = 3, SatisfactionRating = 3, TextFeedback = "Treatment was okay, but could be better", TreatmentEvaluationScore = 65.0, SentimentAnalysis = "Neutral", SentimentScore = 0.1, CreatedAt = DateTime.UtcNow.AddDays(-2), IsProcessed = true },
            new() { PatientId = 5, DoctorId = 10, HospitalId = 5, TreatmentDescription = "General medical consultation", PreTreatmentRating = 2, PostTreatmentRating = 4, SatisfactionRating = 4, TextFeedback = "Good service overall", TreatmentEvaluationScore = 80.0, SentimentAnalysis = "Positive", SentimentScore = 0.6, CreatedAt = DateTime.UtcNow.AddDays(-4), IsProcessed = true }
        };

        context.PatientFeedbacks.AddRange(feedbacks);
        await context.SaveChangesAsync();

        // Update hospital performance metrics
        await UpdateHospitalMetrics(context);
    }

    private static async Task UpdateHospitalMetrics(SCISDbContext context)
    {
        var hospitals = await context.Hospitals.ToListAsync();
        
        foreach (var hospital in hospitals)
        {
            // Calculate average TES
            var averageTES = await context.PatientFeedbacks
                .Where(f => f.HospitalId == hospital.Id && f.IsProcessed)
                .AverageAsync(f => f.TreatmentEvaluationScore);

            // Calculate interoperability success rate (mock data)
            var interopRate = 85.0 + (hospital.Id * 2.5); // Varying rates between hospitals

            // Calculate patient volume (mock data)
            var patientVolume = 200 + (hospital.Id * 50);

            // Calculate performance index
            var performanceIndex = (averageTES * 0.5) + (interopRate * 0.3) + (patientVolume / 10.0 * 0.2);

            hospital.AverageTES = averageTES;
            hospital.InteroperabilitySuccessRate = interopRate;
            hospital.PatientVolume = patientVolume;
            hospital.PerformanceIndex = performanceIndex;
        }

        await context.SaveChangesAsync();
    }
}
