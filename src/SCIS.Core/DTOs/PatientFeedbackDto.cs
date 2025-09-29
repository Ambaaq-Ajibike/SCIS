using System.ComponentModel.DataAnnotations;

namespace SCIS.Core.DTOs;

public class PatientFeedbackDto
{
    [Required]
    public int PatientId { get; set; }
    
    [Required]
    public int DoctorId { get; set; }
    
    [MaxLength(1000)]
    public string? TreatmentDescription { get; set; }
    
    [Required]
    [Range(1, 5)]
    public int PreTreatmentRating { get; set; }
    
    [Required]
    [Range(1, 5)]
    public int PostTreatmentRating { get; set; }
    
    [Required]
    [Range(1, 5)]
    public int SatisfactionRating { get; set; }
    
    [MaxLength(2000)]
    public string? TextFeedback { get; set; }
}

public class PatientFeedbackResponseDto
{
    public int Id { get; set; }
    public double TreatmentEvaluationScore { get; set; }
    public string? SentimentAnalysis { get; set; }
    public double SentimentScore { get; set; }
    public DateTime CreatedAt { get; set; }
}
