namespace SCIS.Core.Interfaces;

public interface IMLService
{
    Task<List<object>> PerformClusteringAsync(List<object> data);
    Task<string> AnalyzeSentimentAsync(string text);
    Task<List<object>> ForecastPatientVolumesAsync(int hospitalId, int days);
    Task<double> CalculatePerformanceIndexAsync(int hospitalId);
    Task<List<object>> GetPerformanceGapsAsync();
    Task<List<object>> GetResourceRecommendationsAsync(int hospitalId);
}
