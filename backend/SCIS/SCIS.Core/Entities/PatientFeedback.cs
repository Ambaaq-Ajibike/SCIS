using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.Entities;

public class PatientFeedback
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    
    public Guid DoctorId { get; set; }
    public User Doctor { get; set; } = null!;
    
    public Guid HospitalId { get; set; }
    public Hospital Hospital { get; set; } = null!;
    
    [MaxLength(1000)]
    public string? TreatmentDescription { get; set; }
    
    [Range(1, 5)]
    public int PreTreatmentRating { get; set; }
    
    [Range(1, 5)]
    public int PostTreatmentRating { get; set; }
    
    [Range(1, 5)]
    public int SatisfactionRating { get; set; }
    
    [MaxLength(2000)]
    public string? TextFeedback { get; set; }
    
    public double TreatmentEvaluationScore { get; set; } = 0.0;
    
    // ML Analysis results
    public string? SentimentAnalysis { get; set; } // Positive, Neutral, Negative
    public double SentimentScore { get; set; } = 0.0;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsProcessed { get; set; } = false;
}
