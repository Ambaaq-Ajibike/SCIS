'use client';

import { useState, useEffect } from 'react';
import { hospitalSettingsService, hospitalService, HospitalSettingsDto, UpdateHospitalSettingsDto, HospitalDto } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Layout from '../../components/Layout';
import DataRequestEndpointManager from '../../components/DataRequestEndpointManager';
import { toast } from 'react-toastify';

interface EndpointField {
  key: keyof UpdateHospitalSettingsDto;
  label: string;
  placeholder: string;
  description: string;
  validationKey: keyof HospitalSettingsDto;
  parameterKey: keyof UpdateHospitalSettingsDto;
}

const ENDPOINT_FIELDS: EndpointField[] = [
  {
    key: 'patientEverythingEndpoint',
    label: 'Patient Everything Endpoint',
    placeholder: 'https://hapi.fhir.org/baseR4/Patient/{patientId}/$everything',
    description: 'FHIR Patient $everything endpoint that returns a Bundle containing all patient data (Patient, Observations, Conditions, etc.)',
    validationKey: 'isPatientEverythingEndpointValid',
    parameterKey: 'patientEverythingEndpointParameters'
  }
];

export default function HospitalSettingsPage() {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState<HospitalDto[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [settings, setSettings] = useState<HospitalSettingsDto | null>(null);
  const [loading, setLoading] = useState(false);

  // Remove setMessage calls - use toast instead

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
      toast.error('Failed to load hospitals', {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  const loadHospitalSettings = async (hospitalId: string) => {
    setLoading(true);
    try {
      const data = await hospitalSettingsService.getHospitalSettings(hospitalId);
      setSettings(data);
    } catch (error) {
      console.error('Error loading hospital settings:', error);
      toast.error('Failed to load hospital settings', {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
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
                Configure the Patient Everything endpoint that returns a comprehensive FHIR Bundle containing all patient data
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


              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading settings...</span>
                </div>
              ) : selectedHospitalId ? (
                <div className="space-y-6">
                  
                  {/* Data Request Endpoints Manager */}
                  <div className="mt-8">
                    <DataRequestEndpointManager 
                      hospitalId={selectedHospitalId} 
                      userRole={user?.role || ''} 
                    />
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