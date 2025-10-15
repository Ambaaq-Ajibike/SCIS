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
  Download,
  X
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import DataRequestManager from '@/components/DataRequestManager';
import { dataRequestService } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import DataRequestForm from '@/components/DataRequestForm';
import { useRouter } from 'next/navigation';

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
  const { user } = useAuth();
  const router = useRouter();
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
      // Find the selected patient to get their patientId
      const selectedPatient = patients.find(p => p.id === data.patientId);
      if (!selectedPatient) {
        throw new Error('Selected patient not found');
      }

      const response = await dataRequestService.requestData({
        patientId: selectedPatient.patientId, // Use the patient's identifier, not the database ID
        dataType: data.dataType || '',
        purpose: data.purpose
      });
      setRequests(prev => [response, ...prev]);
      setShowNewRequest(false);
      reset();
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleIntraHospitalSuccess = (responseData: string, dataType: string, patientId?: string) => {
    // Build URL parameters for the patient data page
    const params = new URLSearchParams({
      data: encodeURIComponent(responseData),
      type: dataType,
    });
    
    // If we have patient info, add it to the URL
    if (patientId) {
      const selectedPatient = patients.find(p => p.patientId === patientId);
      if (selectedPatient) {
        params.append('patientId', encodeURIComponent(selectedPatient.patientId));
        params.append('patientName', encodeURIComponent(`${selectedPatient.firstName} ${selectedPatient.lastName}`));
        params.append('hospitalName', encodeURIComponent(selectedPatient.hospitalName));
      }
    }
    
    // Close modal and redirect
    setShowNewRequest(false);
    router.push(`/patient-data?${params.toString()}`);
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
    <ProtectedRoute allowedRoles={['SystemManager', 'HospitalManager', 'Doctor', 'Staff']}>
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

          {/* Data Request Manager */}
          <DataRequestManager userRole={user?.role || ''} />

          {/* New Request Modal */}
          {showNewRequest && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                 <DataRequestForm 
                   onRequestSubmitted={() => {
                     // Refresh data request manager when a new request is submitted
                     window.location.reload();
                   }}
                   onIntraHospitalSuccess={handleIntraHospitalSuccess}
                 />
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
