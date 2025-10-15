using System.Text.Json;
using Microsoft.Extensions.Logging;
using SCIS.Core.DTOs;
using SCIS.Core.Interfaces;

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

            _logger.LogInformation("Validating FHIR Patient Everything endpoint: {EndpointUrl}", endpointUrl);

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

            // Validate FHIR Bundle structure for Patient Everything endpoint
            var isValidBundle = ValidateFhirBundle(responseContent, out var errorMessage);
            
            if (isValidBundle)
            {
                validationResult.IsValid = true;
                validationResult.ResponseSample = TruncateResponseSample(responseContent);
                _logger.LogInformation("Successfully validated FHIR Patient Everything endpoint: {EndpointUrl}", endpointUrl);
            }
            else
            {
                validationResult.ErrorMessage = errorMessage;
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

    private static bool ValidateFhirBundle(string jsonResponse, out string errorMessage)
    {
        errorMessage = string.Empty;
        
        try
        {
            using var document = JsonDocument.Parse(jsonResponse);
            var root = document.RootElement;

            // Check for basic FHIR Bundle structure
            if (!root.TryGetProperty("resourceType", out var resourceTypeElement))
            {
                errorMessage = "Missing 'resourceType' field - not a valid FHIR resource";
                return false;
            }

            var resourceType = resourceTypeElement.GetString();
            if (resourceType != "Bundle")
            {
                errorMessage = $"Expected 'Bundle' resourceType, but got '{resourceType}'";
                return false;
            }

            // Check for required Bundle fields
            if (!root.TryGetProperty("type", out var typeElement))
            {
                errorMessage = "Missing 'type' field in Bundle";
                return false;
            }

            var bundleType = typeElement.GetString();
            if (bundleType != "searchset")
            {
                errorMessage = $"Expected 'searchset' bundle type, but got '{bundleType}'";
                return false;
            }

            // Check for entry array
            if (!root.TryGetProperty("entry", out var entryElement) || entryElement.ValueKind != JsonValueKind.Array)
            {
                errorMessage = "Missing or invalid 'entry' array in Bundle";
                return false;
            }

            var entries = entryElement.EnumerateArray().ToList();
            if (entries.Count == 0)
            {
                errorMessage = "Bundle contains no entries";
                return false;
            }

            // Collect all resource types and check for patient references
            var resourceTypes = new HashSet<string>();
            var patientReferences = new HashSet<string>();
            bool hasPatientResource = false;

            foreach (var entry in entries)
            {
                if (entry.TryGetProperty("resource", out var resourceElement))
                {
                    if (resourceElement.TryGetProperty("resourceType", out var entryResourceType))
                    {
                        var entryType = entryResourceType.GetString();
                        resourceTypes.Add(entryType ?? "");
                        
                        if (entryType == "Patient")
                        {
                            hasPatientResource = true;
                        }
                        
                        // Check for patient references in resources
                        if (resourceElement.TryGetProperty("subject", out var subjectElement))
                        {
                            if (subjectElement.TryGetProperty("reference", out var referenceElement))
                            {
                                var reference = referenceElement.GetString();
                                if (!string.IsNullOrEmpty(reference) && reference.StartsWith("Patient/"))
                                {
                                    patientReferences.Add(reference);
                                }
                            }
                        }
                        
                        // Also check for patient field (used in Device resources)
                        if (resourceElement.TryGetProperty("patient", out var patientElement))
                        {
                            if (patientElement.TryGetProperty("reference", out var patientRefElement))
                            {
                                var patientRef = patientRefElement.GetString();
                                if (!string.IsNullOrEmpty(patientRef) && patientRef.StartsWith("Patient/"))
                                {
                                    patientReferences.Add(patientRef);
                                }
                            }
                        }
                    }
                }
            }

            // For Patient Everything endpoint, we should have either:
            // 1. A Patient resource directly, OR
            // 2. Resources that reference patients (which is what we see in this response)
            if (!hasPatientResource && patientReferences.Count == 0)
            {
                errorMessage = "Bundle should contain either Patient resources or resources that reference patients";
                return false;
            }

            // Check for common FHIR resource types that should be present in Patient Everything
            var expectedResourceTypes = new[] { "Patient", "Observation", "Condition", "Encounter", "Device" };
            var hasExpectedTypes = expectedResourceTypes.Any(type => resourceTypes.Contains(type));

            if (!hasExpectedTypes)
            {
                errorMessage = $"Bundle should contain common FHIR resources. Found: {string.Join(", ", resourceTypes)}";
                return false;
            }

            // If we have a Patient resource, validate its required fields
            if (hasPatientResource)
            {
                var patientEntry = entries.FirstOrDefault(e => 
                    e.TryGetProperty("resource", out var res) && 
                    res.TryGetProperty("resourceType", out var rt) && 
                    rt.GetString() == "Patient");

                if (patientEntry.ValueKind != JsonValueKind.Undefined)
                {
                    var patientResource = patientEntry.GetProperty("resource");
                    
                    // Check for required Patient fields
                    if (!patientResource.TryGetProperty("id", out _))
                    {
                        errorMessage = "Patient resource missing required 'id' field";
                        return false;
                    }

                    if (!patientResource.TryGetProperty("name", out _))
                    {
                        errorMessage = "Patient resource missing required 'name' field";
                        return false;
                    }
                }
            }

            return true;
        }
        catch (JsonException ex)
        {
            errorMessage = $"Invalid JSON format: {ex.Message}";
            return false;
        }
        catch (Exception ex)
        {
            errorMessage = $"Validation error: {ex.Message}";
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
