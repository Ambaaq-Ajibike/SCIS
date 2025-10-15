'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Settings
} from 'lucide-react';
import api from '@/lib/api';

interface DataRequestEndpoint {
  id: string;
  hospitalId: string;
  dataType: string;
  dataTypeDisplayName: string;
  endpointUrl: string;
  fhirResourceType: string;
  httpMethod: string;
  description?: string;
  isActive: boolean;
  isEndpointValid: boolean;
  lastValidationDate?: string;
  lastValidationError?: string;
  allowedRoles?: string;
  hospitalName?: string;
}

interface DataRequestEndpointManagerProps {
  hospitalId: string;
  userRole: string;
}

export default function DataRequestEndpointManager({ hospitalId, userRole }: DataRequestEndpointManagerProps) {
  const [endpoints, setEndpoints] = useState<DataRequestEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<DataRequestEndpoint | null>(null);
  const [availableDataTypes, setAvailableDataTypes] = useState<string[]>([]);
  const [availableFhirResourceTypes, setAvailableFhirResourceTypes] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    dataType: '',
    dataTypeDisplayName: '',
    endpointUrl: '',
    fhirResourceType: '',
    httpMethod: 'GET',
    description: '',
    isActive: true,
    apiKey: '',
    authToken: '',
    allowedRoles: '["Doctor", "HospitalManager"]'
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch endpoints and available data types
  useEffect(() => {
    fetchEndpoints();
    fetchAvailableDataTypes();
  }, [hospitalId]);

  const fetchAvailableDataTypes = async () => {
    try {
      const [dataTypesResponse, fhirTypesResponse] = await Promise.all([
        api.get('/datarequestendpoint/data-types'),
        api.get('/datarequestendpoint/fhir-resource-types')
      ]);
      setAvailableDataTypes(dataTypesResponse.data);
      setAvailableFhirResourceTypes(fhirTypesResponse.data);
    } catch (error) {
      console.error('Error fetching available data types:', error);
    }
  };

  const fetchEndpoints = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/datarequestendpoint/hospital/${hospitalId}`);
      setEndpoints(response.data);
    } catch (error) {
      console.error('Error fetching endpoints:', error);
      setMessage({ type: 'error', text: 'Error fetching endpoints' });
    } finally {
      setLoading(false);
    }
  };

  const validateEndpoint = async (endpointId: string) => {
    try {
      await api.post(`/datarequestendpoint/${endpointId}/validate`);
      setMessage({ type: 'success', text: 'Endpoint validation completed' });
      fetchEndpoints(); // Refresh the list
    } catch (error) {
      console.error('Error validating endpoint:', error);
      setMessage({ type: 'error', text: 'Error validating endpoint' });
    }
  };

  const deleteEndpoint = async (endpointId: string) => {
    if (!confirm('Are you sure you want to delete this endpoint?')) {
      return;
    }

    try {
      await api.delete(`/datarequestendpoint/${endpointId}`);
      setMessage({ type: 'success', text: 'Endpoint deleted successfully' });
      fetchEndpoints(); // Refresh the list
    } catch (error) {
      console.error('Error deleting endpoint:', error);
      setMessage({ type: 'error', text: 'Error deleting endpoint' });
    }
  };

  const resetForm = () => {
    setFormData({
      dataType: '',
      dataTypeDisplayName: '',
      endpointUrl: '',
      fhirResourceType: '',
      httpMethod: 'GET',
      description: '',
      isActive: true,
      apiKey: '',
      authToken: '',
      allowedRoles: '["Doctor", "HospitalManager"]'
    });
    setEditingEndpoint(null);
    setShowCreateForm(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-populate display name and FHIR resource type based on data type
    if (field === 'dataType' && typeof value === 'string') {
      const displayName = value.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
      const fhirResourceType = getFhirResourceTypeForDataType(value);
      
      setFormData(prev => ({
        ...prev,
        dataTypeDisplayName: displayName,
        fhirResourceType: fhirResourceType
      }));
    }
  };

  const getFhirResourceTypeForDataType = (dataType: string): string => {
    const mapping: Record<string, string> = {
      'LabResults': 'DiagnosticReport',
      'MedicalHistory': 'Condition',
      'TreatmentRecords': 'Procedure',
      'PatientDemographics': 'Patient',
      'VitalSigns': 'Observation',
      'Medications': 'MedicationRequest',
      'Procedures': 'Procedure',
      'DiagnosticReports': 'DiagnosticReport',
      'Encounters': 'Encounter',
      'Conditions': 'Condition',
      'Allergies': 'AllergyIntolerance',
      'Immunizations': 'Immunization'
    };
    return mapping[dataType] || 'Bundle';
  };

  const handleEdit = (endpoint: DataRequestEndpoint) => {
    setFormData({
      dataType: endpoint.dataType,
      dataTypeDisplayName: endpoint.dataTypeDisplayName,
      endpointUrl: endpoint.endpointUrl,
      fhirResourceType: endpoint.fhirResourceType,
      httpMethod: endpoint.httpMethod,
      description: endpoint.description || '',
      isActive: endpoint.isActive,
      apiKey: endpoint.apiKey || '',
      authToken: endpoint.authToken || '',
      allowedRoles: endpoint.allowedRoles || '["Doctor", "HospitalManager"]'
    });
    setEditingEndpoint(endpoint);
    setShowCreateForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        hospitalId: hospitalId,
        dataType: formData.dataType,
        dataTypeDisplayName: formData.dataTypeDisplayName,
        endpointUrl: formData.endpointUrl,
        fhirResourceType: formData.fhirResourceType,
        httpMethod: formData.httpMethod,
        description: formData.description,
        isActive: formData.isActive,
        apiKey: formData.apiKey || undefined,
        authToken: formData.authToken || undefined,
        allowedRoles: formData.allowedRoles
      };

      if (editingEndpoint) {
        // Update existing endpoint
        await api.put(`/datarequestendpoint/${editingEndpoint.id}`, payload);
        setMessage({ type: 'success', text: 'Endpoint updated successfully' });
      } else {
        // Create new endpoint
        await api.post('/datarequestendpoint', payload);
        setMessage({ type: 'success', text: 'Endpoint created successfully' });
      }

      resetForm();
      fetchEndpoints(); // Refresh the list
    } catch (error) {
      console.error('Error saving endpoint:', error);
      setMessage({ type: 'error', text: 'Error saving endpoint' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (endpoint: DataRequestEndpoint) => {
    if (!endpoint.isActive) {
      return <XCircle className="h-4 w-4 text-gray-400" />;
    }
    
    if (endpoint.isEndpointValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (endpoint: DataRequestEndpoint) => {
    if (!endpoint.isActive) {
      return 'Inactive';
    }
    
    if (endpoint.isEndpointValid) {
      return 'Valid';
    } else {
      return 'Invalid';
    }
  };

  const getStatusColor = (endpoint: DataRequestEndpoint) => {
    if (!endpoint.isActive) {
      return 'text-gray-500';
    }
    
    if (endpoint.isEndpointValid) {
      return 'text-green-600';
    } else {
      return 'text-red-600';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Settings className="h-5 w-5 text-primary-600 mr-2" />
            Data Request Endpoints
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Configure FHIR endpoints for different types of patient data requests
          </p>
        </div>
        
        {(userRole === 'HospitalManager' || userRole === 'SystemAdmin') && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Endpoint
          </button>
        )}
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Endpoints Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {endpoints.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No endpoints configured</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first data request endpoint.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {endpoints.map((endpoint) => (
              <li key={endpoint.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(endpoint)}
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {endpoint.dataTypeDisplayName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {endpoint.fhirResourceType} • {endpoint.httpMethod}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 truncate">
                        {endpoint.endpointUrl}
                      </p>
                      {endpoint.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {endpoint.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(endpoint)}`}>
                        {getStatusText(endpoint)}
                      </span>
                      {endpoint.lastValidationDate && (
                        <span className="text-xs text-gray-500">
                          Last validated: {new Date(endpoint.lastValidationDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {endpoint.lastValidationError && (
                      <p className="text-xs text-red-600 mt-1">
                        Error: {endpoint.lastValidationError}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => validateEndpoint(endpoint.id)}
                      className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                      title="Validate endpoint"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    
                    {(userRole === 'HospitalManager' || userRole === 'SystemAdmin') && (
                      <>
                        <button
                          onClick={() => handleEdit(endpoint)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          title="Edit endpoint"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => deleteEndpoint(endpoint.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                          title="Delete endpoint"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingEndpoint) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingEndpoint ? 'Edit Endpoint' : 'Create New Endpoint'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Data Type */}
                <div>
                  <label htmlFor="dataType" className="block text-sm font-medium text-gray-700 mb-1">
                    Data Type *
                  </label>
                  <select
                    id="dataType"
                    value={formData.dataType}
                    onChange={(e) => handleInputChange('dataType', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select data type</option>
                    {availableDataTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Display Name */}
                <div>
                  <label htmlFor="dataTypeDisplayName" className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    id="dataTypeDisplayName"
                    value={formData.dataTypeDisplayName}
                    onChange={(e) => handleInputChange('dataTypeDisplayName', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* FHIR Resource Type */}
                <div>
                  <label htmlFor="fhirResourceType" className="block text-sm font-medium text-gray-700 mb-1">
                    FHIR Resource Type *
                  </label>
                  <select
                    id="fhirResourceType"
                    value={formData.fhirResourceType}
                    onChange={(e) => handleInputChange('fhirResourceType', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select FHIR resource type</option>
                    {availableFhirResourceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* HTTP Method */}
                <div>
                  <label htmlFor="httpMethod" className="block text-sm font-medium text-gray-700 mb-1">
                    HTTP Method *
                  </label>
                  <select
                    id="httpMethod"
                    value={formData.httpMethod}
                    onChange={(e) => handleInputChange('httpMethod', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
              </div>

              {/* Endpoint URL */}
              <div>
                <label htmlFor="endpointUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Endpoint URL *
                </label>
                <input
                  type="url"
                  id="endpointUrl"
                  value={formData.endpointUrl}
                  onChange={(e) => handleInputChange('endpointUrl', e.target.value)}
                  placeholder="https://hapi.fhir.org/baseR4/Patient/{patientId}"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {`{patientId}`} as placeholder for patient ID
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe what this endpoint returns..."
                />
              </div>

              {/* Authentication */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    id="apiKey"
                    value={formData.apiKey}
                    onChange={(e) => handleInputChange('apiKey', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional API key"
                  />
                </div>

                <div>
                  <label htmlFor="authToken" className="block text-sm font-medium text-gray-700 mb-1">
                    Auth Token
                  </label>
                  <input
                    type="password"
                    id="authToken"
                    value={formData.authToken}
                    onChange={(e) => handleInputChange('authToken', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional auth token"
                  />
                </div>
              </div>

              {/* Allowed Roles */}
              <div>
                <label htmlFor="allowedRoles" className="block text-sm font-medium text-gray-700 mb-1">
                  Allowed Roles
                </label>
                <input
                  type="text"
                  id="allowedRoles"
                  value={formData.allowedRoles}
                  onChange={(e) => handleInputChange('allowedRoles', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder='["Doctor", "HospitalManager"]'
                />
                <p className="text-xs text-gray-500 mt-1">
                  JSON array of roles that can access this endpoint
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active (endpoint is enabled)
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingEndpoint ? 'Update Endpoint' : 'Create Endpoint')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
