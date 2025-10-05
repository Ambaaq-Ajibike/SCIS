'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Eye,
  Download
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { dataRequestService } from '@/lib/api';

const requestSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  dataType: z.string().min(1, 'Data type is required'),
  purpose: z.string().optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface DataRequest {
  id: string;
  status: string;
  responseData?: string;
  denialReason?: string;
  requestDate: string;
  responseDate?: string;
  responseTimeMs: number;
  isConsentValid: boolean;
  isRoleAuthorized: boolean;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientId: string;
  hospitalName: string;
}

const dataTypes = [
  'Medical Records',
  'Lab Results',
  'Imaging Reports',
  'Medication History',
  'Vital Signs',
  'Treatment Plans',
  'Discharge Summary',
  'Emergency Contacts',
];

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Denied: 'bg-red-100 text-red-800',
  Completed: 'bg-blue-100 text-blue-800',
};

export default function DataRequestsPage() {
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch requests and patients
      const [requestsData, patientsData] = await Promise.all([
        dataRequestService.getRequestHistory(),
        // Mock patients data
        Promise.resolve([
          { id: '1', firstName: 'John', lastName: 'Doe', patientId: 'P001', hospitalName: 'City General Hospital' },
          { id: '2', firstName: 'Jane', lastName: 'Smith', patientId: 'P002', hospitalName: 'Metro Medical Center' },
          { id: '3', firstName: 'Bob', lastName: 'Wilson', patientId: 'P003', hospitalName: 'Regional Health Center' },
        ])
      ]);

      setRequests(requestsData);
      setPatients(patientsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const onSubmit = async (data: RequestFormData) => {
    setSubmitting(true);
    try {
      const response = await dataRequestService.requestData(data);
      setRequests(prev => [response, ...prev]);
      setShowNewRequest(false);
      reset();
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-4 w-4" />;
      case 'Approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'Denied':
        return <XCircle className="h-4 w-4" />;
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['HospitalManager', 'Doctor', 'Staff']}>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Data Requests</h1>
                <p className="text-gray-600">Manage FHIR-compliant data exchange requests</p>
              </div>
              <button
                onClick={() => setShowNewRequest(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 bg-white shadow rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Search
                </label>
                <div className="mt-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Search by request ID..."
                  />
                </div>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Denied">Denied</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No data requests found
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {request.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[request.status as keyof typeof statusColors]}`}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Medical Records
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(request.requestDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.responseTimeMs}ms
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-primary-600 hover:text-primary-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            {request.status === 'Completed' && (
                              <button className="text-green-600 hover:text-green-900">
                                <Download className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* New Request Modal */}
          {showNewRequest && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">New Data Request</h3>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
                        Patient
                      </label>
                      <select
                        {...register('patientId')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="">Select a patient</option>
                        {patients.map((patient) => (
                          <option key={patient.id} value={patient.id}>
                            {patient.firstName} {patient.lastName} ({patient.patientId}) - {patient.hospitalName}
                          </option>
                        ))}
                      </select>
                      {errors.patientId && (
                        <p className="mt-1 text-sm text-red-600">{errors.patientId.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="dataType" className="block text-sm font-medium text-gray-700">
                        Data Type
                      </label>
                      <select
                        {...register('dataType')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="">Select data type</option>
                        {dataTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors.dataType && (
                        <p className="mt-1 text-sm text-red-600">{errors.dataType.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                        Purpose (Optional)
                      </label>
                      <textarea
                        {...register('purpose')}
                        rows={3}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Describe the purpose of this data request..."
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowNewRequest(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Request'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
