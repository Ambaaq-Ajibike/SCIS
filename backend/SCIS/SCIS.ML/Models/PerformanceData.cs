namespace SCIS.ML.Models;

public class PerformanceData
{
    public float TES { get; set; }
    public float InteroperabilityRate { get; set; }
    public float PatientVolume { get; set; }
    public float PerformanceIndex { get; set; }
    public int HospitalId { get; set; }
}

public class PerformancePrediction
{
    public float[] Score { get; set; } = Array.Empty<float>();
    public uint PredictedClusterId { get; set; }
}
