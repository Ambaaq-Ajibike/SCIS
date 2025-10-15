'use client';

import { useState } from 'react';
import { 
  FileText, 
  User, 
  Building2, 
  Send,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { dataRequestService } from '@/lib/api';

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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const dataTypes = [
    { value: 'LabResults', label: 'Lab Results' },
    { value: 'MedicalHistory', label: 'Medical History' },
    { value: 'TreatmentRecords', label: 'Treatment Records' },
    { value: 'ImagingReports', label: 'Imaging Reports' },
    { value: 'MedicationHistory', label: 'Medication History' }
  ];

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
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 text-primary-600 mr-2" />
          Request Patient Data
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient ID */}
          <div>
            <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-1" />
              Patient ID
            </label>
            <input
              type="text"
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter patient ID or search for patient..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the patient's unique identifier. The system will automatically determine which hospital the patient belongs to.
            </p>
          </div>

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
              disabled={loading}
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
        </form>
      </div>
    </div>
  );
}
