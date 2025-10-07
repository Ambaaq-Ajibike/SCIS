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
        context.PatientFeedbacks.RemoveRange(await context.PatientFeedbacks.ToListAsync());
        context.PatientConsents.RemoveRange(await context.PatientConsents.ToListAsync());
        context.Users.RemoveRange(await context.Users.ToListAsync());
        context.Patients.RemoveRange(await context.Patients.ToListAsync());
        context.Hospitals.RemoveRange(await context.Hospitals.ToListAsync());
        await context.SaveChangesAsync();

        // Create hospitals
        var hospital1 = new Hospital { Name = "City General Hospital", Address = "123 Main St, City", PhoneNumber = "555-0101", Email = "info@citygeneral.com", LicenseNumber = "HOSP001" };
        var hospital2 = new Hospital { Name = "Metro Medical Center", Address = "456 Health Ave, Metro", PhoneNumber = "555-0102", Email = "contact@metromedical.com", LicenseNumber = "HOSP002" };
        var hospital3 = new Hospital { Name = "Regional Health Center", Address = "789 Care Blvd, Region", PhoneNumber = "555-0103", Email = "admin@regionalhealth.com", LicenseNumber = "HOSP003" };
        var hospital4 = new Hospital { Name = "Community Hospital", Address = "321 Wellness St, Community", PhoneNumber = "555-0104", Email = "support@communityhospital.com", LicenseNumber = "HOSP004" };
        var hospital5 = new Hospital { Name = "University Medical Center", Address = "654 Academic Way, University", PhoneNumber = "555-0105", Email = "info@universitymedical.com", LicenseNumber = "HOSP005" };

        context.Hospitals.AddRange(hospital1, hospital2, hospital3, hospital4, hospital5);
        await context.SaveChangesAsync();

        // Create users
        var manager1 = new User { Username = "manager1", Email = "manager1@citygeneral.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "HospitalManager", HospitalId = hospital1.Id };
        var manager2 = new User { Username = "manager2", Email = "manager2@metromedical.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "HospitalManager", HospitalId = hospital2.Id };
        var manager3 = new User { Username = "manager3", Email = "manager3@regionalhealth.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "HospitalManager", HospitalId = hospital3.Id };
        var manager4 = new User { Username = "manager4", Email = "manager4@communityhospital.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "HospitalManager", HospitalId = hospital4.Id };
        var manager5 = new User { Username = "manager5", Email = "manager5@universitymedical.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "HospitalManager", HospitalId = hospital5.Id };

        var doctor1 = new User { Username = "dr_sarah_johnson", Email = "sarah.johnson@citygeneral.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Doctor", HospitalId = hospital1.Id };
        var doctor2 = new User { Username = "dr_michael_chen", Email = "michael.chen@metromedical.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Doctor", HospitalId = hospital2.Id };
        var doctor3 = new User { Username = "dr_emily_davis", Email = "emily.davis@regionalhealth.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Doctor", HospitalId = hospital3.Id };
        var doctor4 = new User { Username = "dr_robert_wilson", Email = "robert.wilson@communityhospital.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Doctor", HospitalId = hospital4.Id };
        var doctor5 = new User { Username = "dr_lisa_brown", Email = "lisa.brown@universitymedical.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Doctor", HospitalId = hospital5.Id };

        var staff1 = new User { Username = "staff1", Email = "staff1@citygeneral.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Staff", HospitalId = hospital1.Id };
        var staff2 = new User { Username = "staff2", Email = "staff2@metromedical.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Staff", HospitalId = hospital2.Id };
        var staff3 = new User { Username = "staff3", Email = "staff3@regionalhealth.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Staff", HospitalId = hospital3.Id };

        var patientDemo = new User { Username = "patient_demo", Email = "patient@demo.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), Role = "Patient", HospitalId = hospital1.Id };

        context.Users.AddRange(manager1, manager2, manager3, manager4, manager5, doctor1, doctor2, doctor3, doctor4, doctor5, staff1, staff2, staff3, patientDemo);
        await context.SaveChangesAsync();

        // Create patients
        var patient1 = new Patient { FirstName = "John", LastName = "Doe", PatientId = "PAT001", DateOfBirth = DateTime.SpecifyKind(new DateTime(1985, 5, 15), DateTimeKind.Utc), Gender = "Male", PhoneNumber = "555-1001", Email = "john.doe@email.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), HospitalId = hospital1.Id, BiometricConsent = true, BiometricConsentDate = DateTime.UtcNow.AddDays(-30) };
        var patient2 = new Patient { FirstName = "Jane", LastName = "Smith", PatientId = "PAT002", DateOfBirth = DateTime.SpecifyKind(new DateTime(1990, 8, 22), DateTimeKind.Utc), Gender = "Female", PhoneNumber = "555-1002", Email = "jane.smith@email.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), HospitalId = hospital2.Id, BiometricConsent = true, BiometricConsentDate = DateTime.UtcNow.AddDays(-15) };
        var patient3 = new Patient { FirstName = "Mike", LastName = "Johnson", PatientId = "PAT003", DateOfBirth = DateTime.SpecifyKind(new DateTime(1978, 12, 3), DateTimeKind.Utc), Gender = "Male", PhoneNumber = "555-1003", Email = "mike.johnson@email.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), HospitalId = hospital3.Id, BiometricConsent = true, BiometricConsentDate = DateTime.UtcNow.AddDays(-7) };
        var patient4 = new Patient { FirstName = "Sarah", LastName = "Williams", PatientId = "PAT004", DateOfBirth = DateTime.SpecifyKind(new DateTime(1992, 3, 18), DateTimeKind.Utc), Gender = "Female", PhoneNumber = "555-1004", Email = "sarah.williams@email.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), HospitalId = hospital4.Id, BiometricConsent = true, BiometricConsentDate = DateTime.UtcNow.AddDays(-20) };
        var patient5 = new Patient { FirstName = "David", LastName = "Brown", PatientId = "PAT005", DateOfBirth = DateTime.SpecifyKind(new DateTime(1988, 7, 9), DateTimeKind.Utc), Gender = "Male", PhoneNumber = "555-1005", Email = "david.brown@email.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"), HospitalId = hospital5.Id, BiometricConsent = true, BiometricConsentDate = DateTime.UtcNow.AddDays(-10) };

        context.Patients.AddRange(patient1, patient2, patient3, patient4, patient5);
        await context.SaveChangesAsync();

        // Create patient consents
        var consent1 = new PatientConsent { PatientId = patient1.Id, RequestingUserId = doctor1.Id, RequestingHospitalId = hospital1.Id, DataType = "LabResults", Purpose = "Treatment planning", IsConsented = true, ConsentDate = DateTime.UtcNow.AddDays(-30), ExpiryDate = DateTime.UtcNow.AddDays(30) };
        var consent2 = new PatientConsent { PatientId = patient1.Id, RequestingUserId = doctor1.Id, RequestingHospitalId = hospital1.Id, DataType = "MedicalHistory", Purpose = "Comprehensive care", IsConsented = true, ConsentDate = DateTime.UtcNow.AddDays(-30), ExpiryDate = DateTime.UtcNow.AddDays(30) };
        var consent3 = new PatientConsent { PatientId = patient2.Id, RequestingUserId = doctor2.Id, RequestingHospitalId = hospital2.Id, DataType = "LabResults", Purpose = "Diagnosis", IsConsented = true, ConsentDate = DateTime.UtcNow.AddDays(-15), ExpiryDate = DateTime.UtcNow.AddDays(15) };
        var consent4 = new PatientConsent { PatientId = patient3.Id, RequestingUserId = doctor3.Id, RequestingHospitalId = hospital3.Id, DataType = "TreatmentRecords", Purpose = "Follow-up care", IsConsented = true, ConsentDate = DateTime.UtcNow.AddDays(-7), ExpiryDate = DateTime.UtcNow.AddDays(23) };

        context.PatientConsents.AddRange(consent1, consent2, consent3, consent4);
        await context.SaveChangesAsync();

        // Create sample patient feedback
        var feedback1 = new PatientFeedback { PatientId = patient1.Id, DoctorId = doctor1.Id, HospitalId = hospital1.Id, TreatmentDescription = "Cardiac consultation and treatment", PreTreatmentRating = 2, PostTreatmentRating = 5, SatisfactionRating = 5, TextFeedback = "Excellent care, very professional and caring staff", TreatmentEvaluationScore = 92.5, SentimentAnalysis = "Positive", SentimentScore = 0.8, CreatedAt = DateTime.UtcNow.AddDays(-5), IsProcessed = true };
        var feedback2 = new PatientFeedback { PatientId = patient2.Id, DoctorId = doctor2.Id, HospitalId = hospital2.Id, TreatmentDescription = "Neurological examination", PreTreatmentRating = 3, PostTreatmentRating = 4, SatisfactionRating = 4, TextFeedback = "Good treatment, but waiting time was long", TreatmentEvaluationScore = 78.3, SentimentAnalysis = "Neutral", SentimentScore = 0.2, CreatedAt = DateTime.UtcNow.AddDays(-3), IsProcessed = true };
        var feedback3 = new PatientFeedback { PatientId = patient3.Id, DoctorId = doctor3.Id, HospitalId = hospital3.Id, TreatmentDescription = "Pediatric checkup", PreTreatmentRating = 1, PostTreatmentRating = 5, SatisfactionRating = 5, TextFeedback = "Amazing doctor, very patient with children", TreatmentEvaluationScore = 95.0, SentimentAnalysis = "Positive", SentimentScore = 0.9, CreatedAt = DateTime.UtcNow.AddDays(-1), IsProcessed = true };
        var feedback4 = new PatientFeedback { PatientId = patient4.Id, DoctorId = doctor4.Id, HospitalId = hospital4.Id, TreatmentDescription = "Orthopedic consultation", PreTreatmentRating = 4, PostTreatmentRating = 3, SatisfactionRating = 3, TextFeedback = "Treatment was okay, but could be better", TreatmentEvaluationScore = 65.0, SentimentAnalysis = "Neutral", SentimentScore = 0.1, CreatedAt = DateTime.UtcNow.AddDays(-2), IsProcessed = true };
        var feedback5 = new PatientFeedback { PatientId = patient5.Id, DoctorId = doctor5.Id, HospitalId = hospital5.Id, TreatmentDescription = "General medical consultation", PreTreatmentRating = 2, PostTreatmentRating = 4, SatisfactionRating = 4, TextFeedback = "Good service overall", TreatmentEvaluationScore = 80.0, SentimentAnalysis = "Positive", SentimentScore = 0.6, CreatedAt = DateTime.UtcNow.AddDays(-4), IsProcessed = true };

        context.PatientFeedbacks.AddRange(feedback1, feedback2, feedback3, feedback4, feedback5);
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
            var interopRate = 85.0 + (hospital.Id.GetHashCode() % 10 * 2.5); // Varying rates between hospitals

            // Calculate patient volume (mock data)
            var patientVolume = 200 + (hospital.Id.GetHashCode() % 10 * 50);

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
