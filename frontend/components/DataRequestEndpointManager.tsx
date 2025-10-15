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

  // Fetch endpoints
  useEffect(() => {
    fetchEndpoints();
  }, [hospitalId]);

  const fetchEndpoints = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/datarequestendpoint/hospital/${hospitalId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setEndpoints(data);
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch endpoints' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error fetching endpoints' });
    } finally {
      setLoading(false);
    }
  };

  const validateEndpoint = async (endpointId: string) => {
    try {
      const response = await fetch(`/api/datarequestendpoint/${endpointId}/validate`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Endpoint validation completed' });
        fetchEndpoints(); // Refresh the list
      } else {
        setMessage({ type: 'error', text: 'Failed to validate endpoint' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error validating endpoint' });
    }
  };

  const deleteEndpoint = async (endpointId: string) => {
    if (!confirm('Are you sure you want to delete this endpoint?')) {
      return;
    }

    try {
      const response = await fetch(`/api/datarequestendpoint/${endpointId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Endpoint deleted successfully' });
        fetchEndpoints(); // Refresh the list
      } else {
        setMessage({ type: 'error', text: 'Failed to delete endpoint' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error deleting endpoint' });
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
                          onClick={() => setEditingEndpoint(endpoint)}
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

      {/* Create/Edit Form Modal would go here */}
      {/* For now, we'll just show a placeholder */}
      {(showCreateForm || editingEndpoint) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingEndpoint ? 'Edit Endpoint' : 'Create New Endpoint'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                This feature will be implemented in the next iteration.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingEndpoint(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
