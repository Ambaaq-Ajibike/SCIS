'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  User, 
  Building2, 
  Send,
  AlertCircle,
  CheckCircle,
  Search,
  Loader2
} from 'lucide-react';
import { dataRequestService } from '@/lib/api';
import { Input } from '@/components/ui/Input';

interface DataRequestFormProps {
  onRequestSubmitted?: () => void;
  onIntraHospitalSuccess?: (responseData: string, dataType: string, patientId: string) => void;
}

export default function DataRequestForm({ onRequestSubmitted, onIntraHospitalSuccess }: DataRequestFormProps) {
  const [formData, setFormData] = useState({
    patientId: '',
    dataType: 'LabResults',
    purpose: ''
  });
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<{ isAvailable: boolean; message?: string; patientHospitalName?: string; patientName?: string; isCrossHospitalRequest?: boolean } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [availableDataTypes, setAvailableDataTypes] = useState<string[]>([]);

  // Default data types as fallback
  const defaultDataTypes = [
    { value: 'LabResults', label: 'Lab Results' },
    { value: 'MedicalHistory', label: 'Medical History' },
    { value: 'TreatmentRecords', label: 'Treatment Records' },
    { value: 'PatientDemographics', label: 'Patient Demographics' },
    { value: 'VitalSigns', label: 'Vital Signs' },
    { value: 'Medications', label: 'Medications' },
    { value: 'Procedures', label: 'Procedures' },
    { value: 'DiagnosticReports', label: 'Diagnostic Reports' },
    { value: 'Encounters', label: 'Encounters' },
    { value: 'Conditions', label: 'Conditions' },
    { value: 'Allergies', label: 'Allergies' },
    { value: 'Immunizations', label: 'Immunizations' }
  ];

  // Fetch available data types from API
  useEffect(() => {
    const fetchDataTypes = async () => {
      try {
        const response = await fetch('/api/datarequestendpoint/data-types');
        if (response.ok) {
          const dataTypes = await response.json();
          setAvailableDataTypes(dataTypes);
        }
      } catch (error) {
        console.error('Failed to fetch data types:', error);
        // Use default data types if API call fails
        setAvailableDataTypes(defaultDataTypes.map(dt => dt.value));
      }
    };

    fetchDataTypes();
  }, []);

  // Create data types array with labels
  const dataTypes = availableDataTypes.length > 0 
    ? availableDataTypes.map(value => {
        const defaultType = defaultDataTypes.find(dt => dt.value === value);
        return {
          value,
          label: defaultType?.label || value.replace(/([A-Z])/g, ' $1').trim()
        };
      })
    : defaultDataTypes;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // First, we need to find the patient by ID to get their GUID
      // For now, we'll assume the patientId is the GUID
      const response = await dataRequestService.requestData({
        patientId: formData.patientId, // This should be the patient's GUID
        dataType: formData.dataType,
        purpose: formData.purpose || undefined
      });

      // Handle intrahospital vs cross-hospital requests
      if (response.isCrossHospitalRequest) {
        setMessage({
          type: 'success',
          text: 'Data request submitted successfully. The patient\'s hospital will be notified and must approve the request.'
        });
        
        if (onRequestSubmitted) {
          onRequestSubmitted();
        }
      } else {
        // Intrahospital request - redirect to show data
        if (onIntraHospitalSuccess && response.responseData) {
          onIntraHospitalSuccess(response.responseData, formData.dataType, formData.patientId);
        } else {
          setMessage({
            type: 'success',
            text: 'Data request processed successfully.'
          });
        }
      }

      // Reset form
      setFormData({
        patientId: '',
        dataType: 'LabResults',
        purpose: ''
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit data request. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear availability status when form data changes
    if (name === 'patientId' || name === 'dataType') {
      setAvailabilityStatus(null);
      setMessage(null);
    }
  };

  const handleCheckAvailability = async () => {
    if (!formData.patientId || !formData.dataType) {
      setMessage({
        type: 'error',
        text: 'Please enter a patient ID and select a data type before checking availability.'
      });
      return;
    }

    setCheckingAvailability(true);
    setAvailabilityStatus(null);
    setMessage(null);

    try {
      const response = await dataRequestService.checkAvailability({
        patientId: formData.patientId,
        dataType: formData.dataType,
        purpose: formData.purpose || undefined
      });

      setAvailabilityStatus({
        isAvailable: response.isAvailable,
        message: response.message,
        patientHospitalName: response.patientHospitalName,
        patientName: response.patientName,
        isCrossHospitalRequest: response.isCrossHospitalRequest
      });

      if (response.isAvailable) {
        setMessage({
          type: 'success',
          text: `Data is available! ${response.patientName ? `Patient: ${response.patientName}` : ''} ${response.patientHospitalName ? `(${response.patientHospitalName})` : ''}. You can now submit your request.`
        });
      } else {
        setMessage({
          type: 'error',
          text: response.message || 'Data is not available. Please check the patient ID and data type.'
        });
      }
    } catch (error: any) {
      setAvailabilityStatus({
        isAvailable: false,
        message: error.response?.data?.message || 'Failed to check data availability. Please try again.'
      });
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to check data availability. Please try again.'
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="px-4 py-5 sm:p-6">
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient ID */}
          <Input
            type="text"
            id="patientId"
            name="patientId"
            label={
              <span>
                <User className="h-4 w-4 inline mr-1" />
                Patient ID
              </span>
            }
            value={formData.patientId}
            onChange={handleInputChange}
            required
            placeholder="Enter patient ID or search for patient..."
            helperText="Enter the patient's unique identifier. The system will automatically determine which hospital the patient belongs to."
          />

          {/* Data Type */}
          <div>
            <label htmlFor="dataType" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Data Type
            </label>
            <select
              id="dataType"
              name="dataType"
              value={formData.dataType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {dataTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Select the type of patient data you need to access.
            </p>
          </div>

          {/* Purpose */}
          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 inline mr-1" />
              Purpose (Optional)
            </label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Describe the purpose of this data request..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Provide a brief explanation of why you need this patient data. This helps with approval decisions.
            </p>
          </div>

          {/* Check Availability Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCheckAvailability}
              disabled={checkingAvailability || !formData.patientId || !formData.dataType}
              className="inline-flex items-center px-4 py-2 border border-primary-600 text-sm font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkingAvailability ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Check Data Availability
                </>
              )}
            </button>
          </div>

          {/* Availability Status */}
          {availabilityStatus && (
            <div className={`p-4 rounded-md border ${
              availabilityStatus.isAvailable
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {availabilityStatus.isAvailable ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h4 className={`text-sm font-medium ${
                    availabilityStatus.isAvailable ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {availabilityStatus.isAvailable ? 'Data Available' : 'Data Not Available'}
                  </h4>
                  <p className={`mt-1 text-sm ${
                    availabilityStatus.isAvailable ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {availabilityStatus.message}
                  </p>
                  {availabilityStatus.patientName && (
                    <p className={`mt-1 text-xs ${
                      availabilityStatus.isAvailable ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      Patient: {availabilityStatus.patientName}
                      {availabilityStatus.patientHospitalName && ` • Hospital: ${availabilityStatus.patientHospitalName}`}
                      {availabilityStatus.isCrossHospitalRequest && ' • Cross-hospital request'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

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

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !availabilityStatus?.isAvailable}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </button>
          </div>
          {!availabilityStatus?.isAvailable && availabilityStatus !== null && (
            <p className="text-sm text-gray-500 text-right mt-2">
              Please check data availability before submitting
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
