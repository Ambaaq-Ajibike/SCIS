using Microsoft.EntityFrameworkCore;
using SCIS.Core.Entities;

namespace SCIS.Infrastructure.Data;

public class SCISDbContext : DbContext
{
    public SCISDbContext(DbContextOptions<SCISDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Hospital> Hospitals { get; set; }
    public DbSet<Patient> Patients { get; set; }
    public DbSet<PatientConsent> PatientConsents { get; set; }
    public DbSet<DataRequest> DataRequests { get; set; }
    public DbSet<PatientFeedback> PatientFeedbacks { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Role).IsRequired().HasMaxLength(50);
            
            entity.HasOne(e => e.Hospital)
                .WithMany(h => h.Users)
                .HasForeignKey(e => e.HospitalId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Hospital configuration
        modelBuilder.Entity<Hospital>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Address).IsRequired().HasMaxLength(500);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.LicenseNumber).HasMaxLength(50);
        });

        // Patient configuration
        modelBuilder.Entity<Patient>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PatientId).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Gender).HasMaxLength(10);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.Email).HasMaxLength(100);
            
            entity.HasOne(e => e.Hospital)
                .WithMany(h => h.Patients)
                .HasForeignKey(e => e.HospitalId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // PatientConsent configuration
        modelBuilder.Entity<PatientConsent>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DataType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Purpose).HasMaxLength(1000);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            
            entity.HasOne(e => e.Patient)
                .WithMany(p => p.PatientConsents)
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(e => e.RequestingUser)
                .WithMany(u => u.PatientConsents)
                .HasForeignKey(e => e.RequestingUserId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(e => e.RequestingHospital)
                .WithMany()
                .HasForeignKey(e => e.RequestingHospitalId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // DataRequest configuration
        modelBuilder.Entity<DataRequest>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DataType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Purpose).HasMaxLength(1000);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
            entity.Property(e => e.ResponseData).HasMaxLength(1000);
            entity.Property(e => e.DenialReason).HasMaxLength(1000);
            
            entity.HasOne(e => e.RequestingUser)
                .WithMany(u => u.DataRequests)
                .HasForeignKey(e => e.RequestingUserId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(e => e.RequestingHospital)
                .WithMany(h => h.DataRequests)
                .HasForeignKey(e => e.RequestingHospitalId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(e => e.Patient)
                .WithMany()
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // PatientFeedback configuration
        modelBuilder.Entity<PatientFeedback>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TreatmentDescription).HasMaxLength(1000);
            entity.Property(e => e.TextFeedback).HasMaxLength(2000);
            entity.Property(e => e.SentimentAnalysis).HasMaxLength(50);
            
            entity.HasOne(e => e.Patient)
                .WithMany(p => p.PatientFeedbacks)
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(e => e.Doctor)
                .WithMany(u => u.PatientFeedbacks)
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);
                
            entity.HasOne(e => e.Hospital)
                .WithMany(h => h.PatientFeedbacks)
                .HasForeignKey(e => e.HospitalId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // AuditLog configuration
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Action).IsRequired().HasMaxLength(50);
            entity.Property(e => e.EntityType).HasMaxLength(100);
            entity.Property(e => e.Details).HasMaxLength(1000);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            entity.Property(e => e.ErrorMessage).HasMaxLength(1000);
            entity.Property(e => e.IpAddress).HasMaxLength(50);
            entity.Property(e => e.UserAgent).HasMaxLength(500);
            
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);
                
            entity.HasOne(e => e.Hospital)
                .WithMany()
                .HasForeignKey(e => e.HospitalId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Indexes
        modelBuilder.Entity<User>()
            .HasIndex(e => e.Email)
            .IsUnique();
            
        modelBuilder.Entity<Patient>()
            .HasIndex(e => e.PatientId)
            .IsUnique();
            
        modelBuilder.Entity<DataRequest>()
            .HasIndex(e => e.Status);
            
        modelBuilder.Entity<PatientFeedback>()
            .HasIndex(e => e.CreatedAt);
            
        modelBuilder.Entity<AuditLog>()
            .HasIndex(e => e.Timestamp);
    }
}
