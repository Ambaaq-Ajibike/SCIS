using Microsoft.EntityFrameworkCore;
using SCIS.Core.DTOs;
using SCIS.Core.Entities;
using SCIS.Core.Interfaces;
using SCIS.Infrastructure.Data;
using System.Net.Http;
using System.Text.Json;

namespace SCIS.Infrastructure.Services;

public class DataRequestEndpointService : IDataRequestEndpointService
{
    private readonly SCISDbContext _context;
    private readonly HttpClient _httpClient;

    public DataRequestEndpointService(SCISDbContext context, HttpClient httpClient)
    {
        _context = context;
        _httpClient = httpClient;
    }

    public async Task<List<DataRequestEndpointDto>> GetEndpointsByHospitalAsync(Guid hospitalId)
    {
        var endpoints = await _context.DataRequestEndpoints
            .Include(e => e.Hospital)
            .Where(e => e.HospitalId == hospitalId)
            .Select(e => new DataRequestEndpointDto
            {
                Id = e.Id,
                HospitalId = e.HospitalId,
                DataType = e.DataType,
                DataTypeDisplayName = e.DataTypeDisplayName,
                EndpointUrl = e.EndpointUrl,
                FhirResourceType = e.FhirResourceType,
                ApiKey = e.ApiKey,
                AuthToken = e.AuthToken,
                HttpMethod = e.HttpMethod,
                Description = e.Description,
                IsActive = e.IsActive,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt,
                IsEndpointValid = e.IsEndpointValid,
                LastValidationDate = e.LastValidationDate,
                LastValidationError = e.LastValidationError,
                EndpointParameters = e.EndpointParameters,
                AllowedRoles = e.AllowedRoles,
                HospitalName = e.Hospital.Name
            })
            .ToListAsync();

        return endpoints;
    }

    public async Task<DataRequestEndpointDto?> GetEndpointByHospitalAndDataTypeAsync(Guid hospitalId, string dataType)
    {
        var endpoint = await _context.DataRequestEndpoints
            .Include(e => e.Hospital)
            .FirstOrDefaultAsync(e => e.HospitalId == hospitalId && e.DataType == dataType && e.IsActive);

        if (endpoint == null)
            return null;

        return new DataRequestEndpointDto
        {
            Id = endpoint.Id,
            HospitalId = endpoint.HospitalId,
            DataType = endpoint.DataType,
            DataTypeDisplayName = endpoint.DataTypeDisplayName,
            EndpointUrl = endpoint.EndpointUrl,
            FhirResourceType = endpoint.FhirResourceType,
            ApiKey = endpoint.ApiKey,
            AuthToken = endpoint.AuthToken,
            HttpMethod = endpoint.HttpMethod,
            Description = endpoint.Description,
            IsActive = endpoint.IsActive,
            CreatedAt = endpoint.CreatedAt,
            UpdatedAt = endpoint.UpdatedAt,
            IsEndpointValid = endpoint.IsEndpointValid,
            LastValidationDate = endpoint.LastValidationDate,
            LastValidationError = endpoint.LastValidationError,
            EndpointParameters = endpoint.EndpointParameters,
            AllowedRoles = endpoint.AllowedRoles,
            HospitalName = endpoint.Hospital.Name
        };
    }

    public async Task<DataRequestEndpointDto> CreateEndpointAsync(CreateDataRequestEndpointDto createDto)
    {
        var endpoint = new DataRequestEndpoint
        {
            HospitalId = createDto.HospitalId,
            DataType = createDto.DataType,
            DataTypeDisplayName = createDto.DataTypeDisplayName,
            EndpointUrl = createDto.EndpointUrl,
            FhirResourceType = createDto.FhirResourceType,
            ApiKey = createDto.ApiKey,
            AuthToken = createDto.AuthToken,
            HttpMethod = createDto.HttpMethod,
            Description = createDto.Description,
            IsActive = createDto.IsActive,
            EndpointParameters = createDto.EndpointParameters,
            AllowedRoles = createDto.AllowedRoles,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.DataRequestEndpoints.Add(endpoint);
        await _context.SaveChangesAsync();

        // Load the hospital name for the response
        await _context.Entry(endpoint)
            .Reference(e => e.Hospital)
            .LoadAsync();

        return new DataRequestEndpointDto
        {
            Id = endpoint.Id,
            HospitalId = endpoint.HospitalId,
            DataType = endpoint.DataType,
            DataTypeDisplayName = endpoint.DataTypeDisplayName,
            EndpointUrl = endpoint.EndpointUrl,
            FhirResourceType = endpoint.FhirResourceType,
            ApiKey = endpoint.ApiKey,
            AuthToken = endpoint.AuthToken,
            HttpMethod = endpoint.HttpMethod,
            Description = endpoint.Description,
            IsActive = endpoint.IsActive,
            CreatedAt = endpoint.CreatedAt,
            UpdatedAt = endpoint.UpdatedAt,
            IsEndpointValid = endpoint.IsEndpointValid,
            LastValidationDate = endpoint.LastValidationDate,
            LastValidationError = endpoint.LastValidationError,
            EndpointParameters = endpoint.EndpointParameters,
            AllowedRoles = endpoint.AllowedRoles,
            HospitalName = endpoint.Hospital.Name
        };
    }

    public async Task<DataRequestEndpointDto> UpdateEndpointAsync(Guid endpointId, UpdateDataRequestEndpointDto updateDto)
    {
        var endpoint = await _context.DataRequestEndpoints
            .Include(e => e.Hospital)
            .FirstOrDefaultAsync(e => e.Id == endpointId);

        if (endpoint == null)
            throw new ArgumentException("Endpoint not found");

        endpoint.DataTypeDisplayName = updateDto.DataTypeDisplayName;
        endpoint.EndpointUrl = updateDto.EndpointUrl;
        endpoint.FhirResourceType = updateDto.FhirResourceType;
        endpoint.ApiKey = updateDto.ApiKey;
        endpoint.AuthToken = updateDto.AuthToken;
        endpoint.HttpMethod = updateDto.HttpMethod;
        endpoint.Description = updateDto.Description;
        endpoint.IsActive = updateDto.IsActive;
        endpoint.EndpointParameters = updateDto.EndpointParameters;
        endpoint.AllowedRoles = updateDto.AllowedRoles;
        endpoint.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new DataRequestEndpointDto
        {
            Id = endpoint.Id,
            HospitalId = endpoint.HospitalId,
            DataType = endpoint.DataType,
            DataTypeDisplayName = endpoint.DataTypeDisplayName,
            EndpointUrl = endpoint.EndpointUrl,
            FhirResourceType = endpoint.FhirResourceType,
            ApiKey = endpoint.ApiKey,
            AuthToken = endpoint.AuthToken,
            HttpMethod = endpoint.HttpMethod,
            Description = endpoint.Description,
            IsActive = endpoint.IsActive,
            CreatedAt = endpoint.CreatedAt,
            UpdatedAt = endpoint.UpdatedAt,
            IsEndpointValid = endpoint.IsEndpointValid,
            LastValidationDate = endpoint.LastValidationDate,
            LastValidationError = endpoint.LastValidationError,
            EndpointParameters = endpoint.EndpointParameters,
            AllowedRoles = endpoint.AllowedRoles,
            HospitalName = endpoint.Hospital.Name
        };
    }

    public async Task<bool> DeleteEndpointAsync(Guid endpointId)
    {
        var endpoint = await _context.DataRequestEndpoints.FindAsync(endpointId);
        if (endpoint == null)
            return false;

        _context.DataRequestEndpoints.Remove(endpoint);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ValidateEndpointAsync(Guid endpointId)
    {
        var endpoint = await _context.DataRequestEndpoints.FindAsync(endpointId);
        if (endpoint == null)
            return false;

        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, endpoint.EndpointUrl);
            
            // Add authentication headers if configured
            if (!string.IsNullOrEmpty(endpoint.ApiKey))
            {
                request.Headers.Add("X-API-Key", endpoint.ApiKey);
            }
            
            if (!string.IsNullOrEmpty(endpoint.AuthToken))
            {
                request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", endpoint.AuthToken);
            }

            var response = await _httpClient.SendAsync(request);
            
            endpoint.IsEndpointValid = response.IsSuccessStatusCode;
            endpoint.LastValidationDate = DateTime.UtcNow;
            endpoint.LastValidationError = response.IsSuccessStatusCode ? null : $"HTTP {response.StatusCode}: {response.ReasonPhrase}";
            endpoint.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return endpoint.IsEndpointValid;
        }
        catch (Exception ex)
        {
            endpoint.IsEndpointValid = false;
            endpoint.LastValidationDate = DateTime.UtcNow;
            endpoint.LastValidationError = ex.Message;
            endpoint.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return false;
        }
    }

    public async Task<List<DataRequestEndpointDto>> GetAllEndpointsAsync()
    {
        var endpoints = await _context.DataRequestEndpoints
            .Include(e => e.Hospital)
            .Select(e => new DataRequestEndpointDto
            {
                Id = e.Id,
                HospitalId = e.HospitalId,
                DataType = e.DataType,
                DataTypeDisplayName = e.DataTypeDisplayName,
                EndpointUrl = e.EndpointUrl,
                FhirResourceType = e.FhirResourceType,
                ApiKey = e.ApiKey,
                AuthToken = e.AuthToken,
                HttpMethod = e.HttpMethod,
                Description = e.Description,
                IsActive = e.IsActive,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt,
                IsEndpointValid = e.IsEndpointValid,
                LastValidationDate = e.LastValidationDate,
                LastValidationError = e.LastValidationError,
                EndpointParameters = e.EndpointParameters,
                AllowedRoles = e.AllowedRoles,
                HospitalName = e.Hospital.Name
            })
            .ToListAsync();

        return endpoints;
    }

    public async Task<DataRequestEndpointDto?> GetEndpointByIdAsync(Guid endpointId)
    {
        var endpoint = await _context.DataRequestEndpoints
            .Include(e => e.Hospital)
            .FirstOrDefaultAsync(e => e.Id == endpointId);

        if (endpoint == null)
            return null;

        return new DataRequestEndpointDto
        {
            Id = endpoint.Id,
            HospitalId = endpoint.HospitalId,
            DataType = endpoint.DataType,
            DataTypeDisplayName = endpoint.DataTypeDisplayName,
            EndpointUrl = endpoint.EndpointUrl,
            FhirResourceType = endpoint.FhirResourceType,
            ApiKey = endpoint.ApiKey,
            AuthToken = endpoint.AuthToken,
            HttpMethod = endpoint.HttpMethod,
            Description = endpoint.Description,
            IsActive = endpoint.IsActive,
            CreatedAt = endpoint.CreatedAt,
            UpdatedAt = endpoint.UpdatedAt,
            IsEndpointValid = endpoint.IsEndpointValid,
            LastValidationDate = endpoint.LastValidationDate,
            LastValidationError = endpoint.LastValidationError,
            EndpointParameters = endpoint.EndpointParameters,
            AllowedRoles = endpoint.AllowedRoles,
            HospitalName = endpoint.Hospital.Name
        };
    }

    public async Task<List<string>> GetAvailableDataTypesAsync()
    {
        return new List<string>
        {
            "LabResults",
            "MedicalHistory", 
            "TreatmentRecords",
            "PatientDemographics",
            "VitalSigns",
            "Medications",
            "Procedures",
            "DiagnosticReports",
            "Encounters",
            "Conditions",
            "Allergies",
            "Immunizations"
        };
    }

    public async Task<List<string>> GetAvailableFhirResourceTypesAsync()
    {
        return new List<string>
        {
            "Patient",
            "Observation",
            "Condition",
            "Procedure",
            "DiagnosticReport",
            "MedicationRequest",
            "Encounter",
            "AllergyIntolerance",
            "Immunization",
            "Bundle"
        };
    }
}
