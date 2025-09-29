namespace SCIS.ML.Models;

public class SentimentData
{
    public string Text { get; set; } = string.Empty;
    public bool Sentiment { get; set; }
}

public class SentimentPrediction
{
    public bool PredictedSentiment { get; set; }
    public float Probability { get; set; }
    public float Score { get; set; }
}
