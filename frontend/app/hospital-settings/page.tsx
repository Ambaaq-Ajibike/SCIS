'use client';

import { useState, useEffect } from 'react';
import { hospitalSettingsService, hospitalService, HospitalSettingsDto, CreateHospitalSettingsDto, UpdateHospitalSettingsDto, EndpointValidationDto, HospitalDto } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Layout from '../../components/Layout';

interface EndpointField {
  key: keyof UpdateHospitalSettingsDto;
  label: string;
  placeholder: string;
  description: string;
  validationKey: keyof HospitalSettingsDto;
}

const ENDPOINT_FIELDS: EndpointField[] = [
  {
    key: 'dataRequestEndpoint',
    label: 'Data Request Endpoint',
    placeholder: 'https://hapi.fhir.org/baseR4/Patient',
    description: 'Endpoint for general data requests',
    validationKey: 'isDataRequestEndpointValid'
  },
  {
    key: 'patientEndpoint',
    label: 'Patient Endpoint',
    placeholder: 'https://hapi.fhir.org/baseR4/Patient',
    description: 'FHIR Patient resource endpoint',
    validationKey: 'isPatientEndpointValid'
  },
  {
    key: 'observationEndpoint',
    label: 'Observation Endpoint',
    placeholder: 'https://hapi.fhir.org/baseR4/Observation',
    description: 'FHIR Observation resource endpoint',
    validationKey: 'isObservationEndpointValid'
  },
  {
    key: 'conditionEndpoint',
    label: 'Condition Endpoint',
    placeholder: 'https://hapi.fhir.org/baseR4/Condition',
    description: 'FHIR Condition resource endpoint',
    validationKey: 'isConditionEndpointValid'
  },
  {
    key: 'medicationEndpoint',
    label: 'Medication Endpoint',
    placeholder: 'https://hapi.fhir.org/baseR4/Medication',
    description: 'FHIR Medication resource endpoint',
    validationKey: 'isMedicationEndpointValid'
  },
  {
    key: 'diagnosticReportEndpoint',
    label: 'Diagnostic Report Endpoint',
    placeholder: 'https://hapi.fhir.org/baseR4/DiagnosticReport',
    description: 'FHIR DiagnosticReport resource endpoint',
    validationKey: 'isDiagnosticReportEndpointValid'
  },
  {
    key: 'procedureEndpoint',
    label: 'Procedure Endpoint',
    placeholder: 'https://hapi.fhir.org/baseR4/Procedure',
    description: 'FHIR Procedure resource endpoint',
    validationKey: 'isProcedureEndpointValid'
  },
  {
    key: 'encounterEndpoint',
    label: 'Encounter Endpoint',
    placeholder: 'https://hapi.fhir.org/baseR4/Encounter',
    description: 'FHIR Encounter resource endpoint',
    validationKey: 'isEncounterEndpointValid'
  },
  {
    key: 'allergyIntoleranceEndpoint',
    label: 'Allergy Intolerance Endpoint',
    placeholder: 'https://hapi.fhir.org/baseR4/AllergyIntolerance',
    description: 'FHIR AllergyIntolerance resource endpoint',
    validationKey: 'isAllergyIntoleranceEndpointValid'
  },
  {
    key: 'immunizationEndpoint',
    label: 'Immunization Endpoint',
    placeholder: 'https://hapi.fhir.org/baseR4/Immunization',
    description: 'FHIR Immunization resource endpoint',
    validationKey: 'isImmunizationEndpointValid'
  }
];

export default function HospitalSettingsPage() {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState<HospitalDto[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [settings, setSettings] = useState<HospitalSettingsDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [validationResults, setValidationResults] = useState<EndpointValidationDto[]>([]);
  const [showFullResponse, setShowFullResponse] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<UpdateHospitalSettingsDto>({});
  const [apiKey, setApiKey] = useState('');
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    loadHospitals();
  }, []);

  useEffect(() => {
    if (selectedHospitalId) {
      loadHospitalSettings(selectedHospitalId);
    }
  }, [selectedHospitalId]);

  const loadHospitals = async () => {
    try {
      const data = await hospitalService.getHospitals();
      setHospitals(data);
      
      // For hospital managers, only show their hospital
      if (user?.role === 'HospitalManager' && user?.hospitalId) {
        const userHospital = data.find(h => h.id === user.hospitalId);
        if (userHospital) {
          setSelectedHospitalId(userHospital.id);
        }
      } else if (data.length > 0) {
        setSelectedHospitalId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading hospitals:', error);
      setMessage({ type: 'error', text: 'Failed to load hospitals' });
    }
  };

  const loadHospitalSettings = async (hospitalId: string) => {
    setLoading(true);
    try {
      const data = await hospitalSettingsService.getHospitalSettings(hospitalId);
      setSettings(data);
      
      // Populate form data
      const formData: UpdateHospitalSettingsDto = {};
      ENDPOINT_FIELDS.forEach(field => {
        const value = data[field.key as keyof HospitalSettingsDto] as string;
        if (value) {
          formData[field.key] = value;
        }
      });
      setFormData(formData);
      setApiKey(data.apiKey || '');
      setAuthToken(data.authToken || '');
    } catch (error) {
      console.error('Error loading hospital settings:', error);
      setMessage({ type: 'error', text: 'Failed to load hospital settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateHospitalSettingsDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!selectedHospitalId) return;

    setSaving(true);
    try {
      const updateData: UpdateHospitalSettingsDto = {
        ...formData,
        apiKey: apiKey || undefined,
        authToken: authToken || undefined
      };

      let updatedSettings: HospitalSettingsDto;
      if (settings) {
        updatedSettings = await hospitalSettingsService.updateHospitalSettings(selectedHospitalId, updateData);
      } else {
        const createData: CreateHospitalSettingsDto = {
          hospitalId: selectedHospitalId,
          ...updateData
        };
        updatedSettings = await hospitalSettingsService.createHospitalSettings(createData);
      }

      setSettings(updatedSettings);
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleValidateEndpoint = async (endpointUrl: string, endpointType: string) => {
    if (!endpointUrl.trim()) return;

    setValidating(endpointType);
    try {
      const result = await hospitalSettingsService.validateEndpoint(endpointUrl, endpointType);
      setValidationResults(prev => {
        const filtered = prev.filter(r => r.endpointType !== endpointType);
        return [...filtered, result];
      });
      
      if (result.isValid) {
        setMessage({ type: 'success', text: `${endpointType} endpoint validated successfully` });
      } else {
        setMessage({ type: 'error', text: `${endpointType} endpoint validation failed: ${result.errorMessage}` });
      }
    } catch (error) {
      console.error('Error validating endpoint:', error);
      setMessage({ type: 'error', text: 'Failed to validate endpoint' });
    } finally {
      setValidating(null);
    }
  };

  const handleValidateAll = async () => {
    if (!selectedHospitalId) return;

    setValidating('all');
    try {
      const updatedSettings = await hospitalSettingsService.validateAllEndpoints(selectedHospitalId);
      setSettings(updatedSettings);
      setMessage({ type: 'success', text: 'All endpoints validated successfully' });
    } catch (error) {
      console.error('Error validating all endpoints:', error);
      setMessage({ type: 'error', text: 'Failed to validate endpoints' });
    } finally {
      setValidating(null);
    }
  };

  const getValidationStatus = (field: EndpointField) => {
    if (!settings) return null;
    const isValid = settings[field.validationKey] as boolean;
    return isValid;
  };

  const getValidationResult = (endpointType: string) => {
    return validationResults.find(r => r.endpointType === endpointType);
  };

  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId);

  return (
    <Layout>
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Hospital Settings</h1>
              <p className="mt-1 text-sm text-gray-600">
                Configure FHIR/HL7 endpoints for hospital data integration
              </p>
            </div>

            <div className="p-6">
              {/* Hospital Selection - Only show for System Managers */}
              {user?.role === 'SystemManager' && (
                <div className="mb-6">
                  <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Hospital
                  </label>
                  <select
                    id="hospital"
                    value={selectedHospitalId}
                    onChange={(e) => setSelectedHospitalId(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a hospital</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Hospital Info for Hospital Managers */}
              {user?.role === 'HospitalManager' && selectedHospitalId && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-900">Hospital Settings</h3>
                  <p className="text-sm text-blue-700">
                    Configuring settings for: <strong>{selectedHospital?.name}</strong>
                  </p>
                </div>
              )}

              {/* Message Display */}
              {message && (
                <div className={`mb-6 p-4 rounded-md ${
                  message.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {message.text}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading settings...</span>
                </div>
              ) : selectedHospitalId ? (
                <div className="space-y-6">
                  {/* Authentication Settings */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Authentication</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                          API Key
                        </label>
                        <input
                          type="password"
                          id="apiKey"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Enter API key if required"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="authToken" className="block text-sm font-medium text-gray-700 mb-1">
                          Auth Token
                        </label>
                        <input
                          type="password"
                          id="authToken"
                          value={authToken}
                          onChange={(e) => setAuthToken(e.target.value)}
                          placeholder="Enter auth token if required"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* FHIR Endpoints */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">FHIR Endpoints</h3>
                      <button
                        onClick={handleValidateAll}
                        disabled={validating === 'all'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {validating === 'all' ? 'Validating...' : 'Validate All'}
                      </button>
                    </div>

                    <div className="space-y-4">
                      {ENDPOINT_FIELDS.map((field) => {
                        const currentValue = formData[field.key] || '';
                        const isValid = getValidationStatus(field);
                        const validationResult = getValidationResult(field.label.replace(' Endpoint', ''));
                        const isCurrentlyValidating = validating === field.label.replace(' Endpoint', '');

                        return (
                          <div key={field.key} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <label htmlFor={field.key} className="block text-sm font-medium text-gray-700">
                                {field.label}
                              </label>
                              <div className="flex items-center space-x-2">
                                {isValid !== null && (
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    isValid 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {isValid ? '✓ Valid' : '✗ Invalid'}
                                  </span>
                                )}
                                {validationResult && (
                                  <span className="text-xs text-gray-500">
                                    {validationResult.responseTimeMs}ms
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">{field.description}</p>
                            
                            <div className="flex space-x-2">
                              <input
                                type="url"
                                id={field.key}
                                value={currentValue}
                                onChange={(e) => handleInputChange(field.key, e.target.value)}
                                placeholder={field.placeholder}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              />
                              <button
                                onClick={() => handleValidateEndpoint(currentValue, field.label.replace(' Endpoint', ''))}
                                disabled={!currentValue.trim() || isCurrentlyValidating}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                              >
                                {isCurrentlyValidating ? 'Validating...' : 'Test'}
                              </button>
                            </div>

                            {validationResult && !validationResult.isValid && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                                <strong>Validation Error:</strong> {validationResult.errorMessage}
                              </div>
                            )}

                            {validationResult && validationResult.responseSample && (
                              <div className="mt-2">
                                <button
                                  onClick={() => setShowFullResponse(showFullResponse === field.key ? null : field.key)}
                                  className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                                >
                                  {showFullResponse === field.key ? 'Hide Response Sample' : 'View Response Sample'}
                                </button>
                                {showFullResponse === field.key && (
                                  <div className="mt-2 p-3 bg-gray-100 rounded border">
                                    <pre className="text-xs text-gray-800 overflow-auto max-h-64 whitespace-pre-wrap">
                                      {validationResult.responseSample}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>

                  {/* Settings Summary */}
                  {settings && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Settings Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Hospital:</span>
                          <span className="ml-2 text-gray-600">{selectedHospital?.name}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Last Updated:</span>
                          <span className="ml-2 text-gray-600">
                            {new Date(settings.updatedAt).toLocaleString()}
                          </span>
                        </div>
                        {settings.lastValidationDate && (
                          <div>
                            <span className="font-medium text-gray-700">Last Validation:</span>
                            <span className="ml-2 text-gray-600">
                              {new Date(settings.lastValidationDate).toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-700">Valid Endpoints:</span>
                          <span className="ml-2 text-gray-600">
                            {ENDPOINT_FIELDS.filter(field => settings[field.validationKey]).length} / {ENDPOINT_FIELDS.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Please select a hospital to configure settings
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}