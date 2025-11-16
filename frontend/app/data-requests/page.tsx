'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search,
  Loader2,
  X
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import DataRequestManager from '@/components/DataRequestManager';
import { useAuth } from '@/lib/auth';
import DataRequestForm from '@/components/DataRequestForm';
import { useRouter } from 'next/navigation';



export default function DataRequestsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleIntraHospitalSuccess = (responseData: string, dataType: string, patientId?: string) => {
    // Build URL parameters for the patient data page
    const params = new URLSearchParams({
      data: encodeURIComponent(responseData),
      type: dataType,
    });
    
    // If we have patient info, add it to the URL
    if (patientId) {
      params.append('patientId', encodeURIComponent(patientId));
    }
    
    // Close modal and redirect
    setShowNewRequest(false);
    router.push(`/patient-data?${params.toString()}`);
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
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowNewRequest(false);
                }
              }}
            >
              <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                {/* Modal Header with Close Button */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Request Patient Data</h3>
                  <button
                    onClick={() => setShowNewRequest(false)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <DataRequestForm 
                  onRequestSubmitted={() => {
                    // Close modal and refresh data request manager
                    setShowNewRequest(false);
                    // Trigger a refresh of the DataRequestManager component
                    window.dispatchEvent(new CustomEvent('refreshDataRequests'));
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
