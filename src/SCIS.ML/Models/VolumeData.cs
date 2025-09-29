namespace SCIS.ML.Models;

public class VolumeData
{
    public float Value { get; set; }
    public DateTime Timestamp { get; set; }
}

public class VolumePrediction
{
    public float[] Forecast { get; set; } = Array.Empty<float>();
    public float[] ConfidenceLowerBound { get; set; } = Array.Empty<float>();
    public float[] ConfidenceUpperBound { get; set; } = Array.Empty<float>();
}
