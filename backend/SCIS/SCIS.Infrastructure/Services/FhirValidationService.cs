using System.Text.Json;
using Microsoft.Extensions.Logging;
using SCIS.Core.DTOs;

namespace SCIS.Infrastructure.Services;

public interface IFhirValidationService
{
    Task<EndpointValidationDto> ValidateEndpointAsync(string endpointUrl, string endpointType);
    Task<bool> IsValidFhirResponseAsync(string jsonResponse, string expectedResourceType);
}

public class FhirValidationService : IFhirValidationService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<FhirValidationService> _logger;

    public FhirValidationService(HttpClient httpClient, ILogger<FhirValidationService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        
        // Set timeout for validation requests
        _httpClient.Timeout = TimeSpan.FromSeconds(30);
        
        // Add common headers for FHIR requests
        _httpClient.DefaultRequestHeaders.Add("Accept", "application/fhir+json");
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "SCIS-FHIR-Validator/1.0");
    }

    public async Task<EndpointValidationDto> ValidateEndpointAsync(string endpointUrl, string endpointType)
    {
        var startTime = DateTime.UtcNow;
        var validationResult = new EndpointValidationDto
        {
            EndpointUrl = endpointUrl,
            EndpointType = endpointType,
            IsValid = false,
            ValidatedAt = startTime
        };

        try
        {
            if (string.IsNullOrWhiteSpace(endpointUrl))
            {
                validationResult.ErrorMessage = "Endpoint URL cannot be empty";
                return validationResult;
            }

            if (!Uri.TryCreate(endpointUrl, UriKind.Absolute, out var uri))
            {
                validationResult.ErrorMessage = "Invalid URL format";
                return validationResult;
            }

            _logger.LogInformation("Validating FHIR endpoint: {EndpointUrl} for type: {EndpointType}", endpointUrl, endpointType);

            // Make a test request to the endpoint
            var response = await _httpClient.GetAsync(endpointUrl);
            validationResult.ResponseTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;

            if (!response.IsSuccessStatusCode)
            {
                validationResult.ErrorMessage = $"HTTP {response.StatusCode}: {response.ReasonPhrase}";
                return validationResult;
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            
            if (string.IsNullOrWhiteSpace(responseContent))
            {
                validationResult.ErrorMessage = "Empty response from endpoint";
                return validationResult;
            }

            // Validate FHIR JSON structure
            var isValidFhir = await IsValidFhirResponseAsync(responseContent, endpointType);
            
            if (isValidFhir)
            {
                validationResult.IsValid = true;
                validationResult.ResponseSample = TruncateResponseSample(responseContent);
                _logger.LogInformation("Successfully validated FHIR endpoint: {EndpointUrl}", endpointUrl);
            }
            else
            {
                validationResult.ErrorMessage = "Response does not conform to FHIR JSON format";
                validationResult.ResponseSample = TruncateResponseSample(responseContent);
            }
        }
        catch (HttpRequestException ex)
        {
            validationResult.ErrorMessage = $"Network error: {ex.Message}";
            _logger.LogWarning(ex, "Network error validating endpoint: {EndpointUrl}", endpointUrl);
        }
        catch (TaskCanceledException ex)
        {
            validationResult.ErrorMessage = "Request timeout - endpoint may be unreachable";
            _logger.LogWarning(ex, "Timeout validating endpoint: {EndpointUrl}", endpointUrl);
        }
        catch (Exception ex)
        {
            validationResult.ErrorMessage = $"Validation error: {ex.Message}";
            _logger.LogError(ex, "Error validating endpoint: {EndpointUrl}", endpointUrl);
        }

        return validationResult;
    }

    public async Task<bool> IsValidFhirResponseAsync(string jsonResponse, string expectedResourceType)
    {
        try
        {
            using var document = JsonDocument.Parse(jsonResponse);
            var root = document.RootElement;

            // Check for basic FHIR structure
            if (!root.TryGetProperty("resourceType", out var resourceTypeElement))
            {
                return false;
            }

            var resourceType = resourceTypeElement.GetString();
            if (string.IsNullOrWhiteSpace(resourceType))
            {
                return false;
            }

            // For Bundle resources, check if it contains entries
            if (resourceType.Equals("Bundle", StringComparison.OrdinalIgnoreCase))
            {
                if (!root.TryGetProperty("entry", out var entryElement) || entryElement.ValueKind != JsonValueKind.Array)
                {
                    return false;
                }

                // If it's a search result bundle, it should have entries
                if (root.TryGetProperty("type", out var typeElement))
                {
                    var bundleType = typeElement.GetString();
                    if (bundleType?.Equals("searchset", StringComparison.OrdinalIgnoreCase) == true)
                    {
                        return entryElement.GetArrayLength() >= 0; // Allow empty search results
                    }
                }

                return entryElement.GetArrayLength() > 0;
            }

            // For individual resources, check if resourceType matches expected type
            if (!string.IsNullOrWhiteSpace(expectedResourceType) && 
                !resourceType.Equals(expectedResourceType, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            // Check for required FHIR fields
            if (!root.TryGetProperty("id", out _))
            {
                return false;
            }

            // Check for meta field (optional but common in FHIR)
            if (root.TryGetProperty("meta", out var metaElement))
            {
                if (metaElement.TryGetProperty("versionId", out _) || 
                    metaElement.TryGetProperty("lastUpdated", out _))
                {
                    // Valid meta structure
                }
            }

            return true;
        }
        catch (JsonException)
        {
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing FHIR JSON response");
            return false;
        }
    }

    private static string TruncateResponseSample(string response, int maxLength = 500)
    {
        if (string.IsNullOrWhiteSpace(response))
            return string.Empty;

        if (response.Length <= maxLength)
            return response;

        return response.Substring(0, maxLength) + "...";
    }
}
