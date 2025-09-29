using Microsoft.ML;
using Microsoft.ML.Data;
using Microsoft.ML.Transforms.TimeSeries;
using SCIS.Core.Interfaces;
using SCIS.ML.Models;

namespace SCIS.ML.Services;

public class MLService : IMLService
{
    private readonly MLContext _mlContext;
    private ITransformer? _sentimentModel;
    private ITransformer? _clusteringModel;
    private ITransformer? _forecastingModel;

    public MLService()
    {
        _mlContext = new MLContext(seed: 1);
    }

    public async Task<List<object>> PerformClusteringAsync(List<object> data)
    {
        // Convert data to PerformanceData
        var performanceData = data.Cast<PerformanceData>().ToList();
        
        if (!performanceData.Any())
            return new List<object>();

        var dataView = _mlContext.Data.LoadFromEnumerable(performanceData);

        // Prepare features
        var pipeline = _mlContext.Transforms.Concatenate("Features", 
            nameof(PerformanceData.TES), 
            nameof(PerformanceData.InteroperabilityRate), 
            nameof(PerformanceData.PatientVolume))
            .Append(_mlContext.Clustering.Trainers.KMeans("Features", numberOfClusters: 3));

        _clusteringModel = pipeline.Fit(dataView);

        var predictions = _clusteringModel.Transform(dataView);
        var results = new List<object>();

        using (var cursor = predictions.GetRowCursor(predictions.Schema))
        {
            var scoreGetter = cursor.GetGetter<VBuffer<float>>(predictions.Schema["Score"]);
            var clusterGetter = cursor.GetGetter<uint>(predictions.Schema["PredictedLabel"]);
            var hospitalGetter = cursor.GetGetter<int>(predictions.Schema[nameof(PerformanceData.HospitalId)]);

            while (cursor.MoveNext())
            {
                VBuffer<float> score = default;
                uint cluster = 0;
                int hospitalId = 0;

                scoreGetter(ref score);
                clusterGetter(ref cluster);
                hospitalGetter(ref hospitalId);

                results.Add(new
                {
                    HospitalId = hospitalId,
                    Cluster = cluster,
                    Score = score.DenseValues().ToArray()
                });
            }
        }

        return results;
    }

    public async Task<string> AnalyzeSentimentAsync(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return "Neutral";

        // Create a simple sentiment analysis model
        var data = new List<SentimentData>
        {
            new() { Text = "Great service, very helpful", Sentiment = true },
            new() { Text = "Excellent treatment, highly recommend", Sentiment = true },
            new() { Text = "Outstanding care and attention", Sentiment = true },
            new() { Text = "Poor service, very disappointed", Sentiment = false },
            new() { Text = "Terrible experience, would not recommend", Sentiment = false },
            new() { Text = "Awful treatment, very upset", Sentiment = false },
            new() { Text = "Average service, nothing special", Sentiment = false },
            new() { Text = "Okay treatment, could be better", Sentiment = false }
        };

        var dataView = _mlContext.Data.LoadFromEnumerable(data);
        
        var pipeline = _mlContext.Transforms.Text.FeaturizeText("Features", nameof(SentimentData.Text))
            .Append(_mlContext.BinaryClassification.Trainers.SdcaLogisticRegression());

        _sentimentModel = pipeline.Fit(dataView);

        var predictionEngine = _mlContext.Model.CreatePredictionEngine<SentimentData, SentimentPrediction>(_sentimentModel);
        var prediction = predictionEngine.Predict(new SentimentData { Text = text });

        return prediction.Probability > 0.6 ? "Positive" : 
               prediction.Probability < 0.4 ? "Negative" : "Neutral";
    }

    public async Task<List<object>> ForecastPatientVolumesAsync(int hospitalId, int days)
    {
        // Generate sample historical data
        var historicalData = GenerateHistoricalVolumeData(hospitalId);
        
        if (historicalData.Count < 30) // Need at least 30 days for forecasting
            return new List<object>();

        var dataView = _mlContext.Data.LoadFromEnumerable(historicalData);

        var pipeline = _mlContext.Forecasting.ForecastBySsa(
            nameof(VolumePrediction.Forecast),
            nameof(VolumeData.Value),
            windowSize: 7,
            seriesLength: historicalData.Count,
            trainSize: historicalData.Count - 7,
            horizon: days);

        _forecastingModel = pipeline.Fit(dataView);

        var forecastEngine = _mlContext.Model.CreateTimeSeriesEngine<VolumeData, VolumePrediction>(_forecastingModel);
        var forecast = forecastEngine.Predict();

        var results = new List<object>();
        for (int i = 0; i < days; i++)
        {
            results.Add(new
            {
                Day = i + 1,
                PredictedVolume = forecast.Forecast[i],
                ConfidenceLower = forecast.ConfidenceLowerBound[i],
                ConfidenceUpper = forecast.ConfidenceUpperBound[i],
                Date = DateTime.Now.AddDays(i + 1)
            });
        }

        return results;
    }

    public async Task<double> CalculatePerformanceIndexAsync(int hospitalId)
    {
        // This would typically fetch data from the database
        // For now, return a mock calculation
        var random = new Random(hospitalId);
        var tes = random.NextDouble() * 0.4 + 0.6; // 0.6 to 1.0
        var interop = random.NextDouble() * 0.3 + 0.7; // 0.7 to 1.0
        var volume = random.NextDouble() * 0.2 + 0.8; // 0.8 to 1.0

        // Apply weights: 0.5 (TES), 0.3 (Interop), 0.2 (Volume)
        return (tes * 0.5) + (interop * 0.3) + (volume * 0.2);
    }

    public async Task<List<object>> GetPerformanceGapsAsync()
    {
        // Mock implementation - would analyze actual performance data
        return new List<object>
        {
            new { HospitalId = 1, Gap = "Low TES scores", Severity = "High" },
            new { HospitalId = 2, Gap = "Poor interoperability", Severity = "Medium" },
            new { HospitalId = 3, Gap = "Resource constraints", Severity = "Low" }
        };
    }

    public async Task<List<object>> GetResourceRecommendationsAsync(int hospitalId)
    {
        // Mock implementation - would analyze actual data
        var recommendations = new List<object>();
        
        var random = new Random(hospitalId);
        if (random.NextDouble() > 0.7)
        {
            recommendations.Add(new { Type = "Staff", Action = "Increase nursing staff by 20%", Priority = "High" });
        }
        
        if (random.NextDouble() > 0.8)
        {
            recommendations.Add(new { Type = "Equipment", Action = "Add 2 additional MRI machines", Priority = "Medium" });
        }
        
        if (random.NextDouble() > 0.6)
        {
            recommendations.Add(new { Type = "Training", Action = "Conduct interoperability training", Priority = "Low" });
        }

        return recommendations;
    }

    private List<VolumeData> GenerateHistoricalVolumeData(int hospitalId)
    {
        var data = new List<VolumeData>();
        var random = new Random(hospitalId);
        var baseVolume = 100 + (hospitalId * 20);

        for (int i = 0; i < 90; i++) // 90 days of historical data
        {
            var date = DateTime.Now.AddDays(-90 + i);
            var volume = baseVolume + random.Next(-20, 21) + (int)(Math.Sin(i * 0.1) * 10);
            
            data.Add(new VolumeData
            {
                Value = Math.Max(0, volume),
                Timestamp = date
            });
        }

        return data;
    }
}
