using SCIS.Core.DTOs;

namespace SCIS.Core.Interfaces;

public interface IDataRequestEndpointService
{
    Task<List<DataRequestEndpointDto>> GetEndpointsByHospitalAsync(Guid hospitalId);
    Task<DataRequestEndpointDto?> GetEndpointByHospitalAndDataTypeAsync(Guid hospitalId, string dataType);
    Task<DataRequestEndpointDto> CreateEndpointAsync(CreateDataRequestEndpointDto createDto);
    Task<DataRequestEndpointDto> UpdateEndpointAsync(Guid endpointId, UpdateDataRequestEndpointDto updateDto);
    Task<bool> DeleteEndpointAsync(Guid endpointId);
    Task<bool> ValidateEndpointAsync(Guid endpointId);
    Task<List<DataRequestEndpointDto>> GetAllEndpointsAsync();
    Task<DataRequestEndpointDto?> GetEndpointByIdAsync(Guid endpointId);
    Task<List<string>> GetAvailableDataTypesAsync();
    Task<List<string>> GetAvailableFhirResourceTypesAsync();
}
