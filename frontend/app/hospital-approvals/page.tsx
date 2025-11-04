'use client';

import { useState, useEffect } from 'react';
import { Building2, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { onboardingService } from '@/lib/api';

interface PendingHospital {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  licenseNumber?: string;
  createdAt: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  verificationDocuments?: string;
  verificationNotes?: string;
}

export default function HospitalApprovalsPage() {
  const [hospitals, setHospitals] = useState<PendingHospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<PendingHospital | null>(null);
  const [approving, setApproving] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingHospitals();
  }, []);

  const fetchPendingHospitals = async () => {
    try {
      setLoading(true);
      const data = await onboardingService.getPendingHospitals();
      setHospitals(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch pending hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (hospitalId: string, isApproved: boolean) => {
    try {
      setApproving(true);
      setError('');
      await onboardingService.approveHospital({
        hospitalId,
        isApproved,
        approvalNotes: approvalNotes || undefined
      });
      setSelectedHospital(null);
      setApprovalNotes('');
      await fetchPendingHospitals();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update hospital status');
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['SystemManager']}>
        <Layout>
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['SystemManager']}>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Hospital Approvals</h1>
            <p className="mt-2 text-gray-600">Review and approve pending hospital registrations</p>
          </div>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {hospitals.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No pending approvals</h3>
              <p className="mt-2 text-sm text-gray-500">All hospitals have been reviewed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {hospitals.map((hospital) => (
                <div key={hospital.id} className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Building2 className="h-8 w-8 text-primary-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{hospital.name}</h3>
                        <p className="text-sm text-gray-500">Registered {new Date(hospital.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedHospital(hospital)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Address:</span> {hospital.address}</p>
                    <p><span className="font-medium">Email:</span> {hospital.email}</p>
                    {hospital.phoneNumber && (
                      <p><span className="font-medium">Phone:</span> {hospital.phoneNumber}</p>
                    )}
                    {hospital.licenseNumber && (
                      <p><span className="font-medium">License:</span> {hospital.licenseNumber}</p>
                    )}
                  </div>

                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => handleApprove(hospital.id, true)}
                      disabled={approving}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleApprove(hospital.id, false)}
                      disabled={approving}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Approval Modal */}
          {selectedHospital && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Hospital Details</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {selectedHospital.name}
                    </div>
                    <div>
                      <span className="font-medium">Address:</span> {selectedHospital.address}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedHospital.email}
                    </div>
                    {selectedHospital.phoneNumber && (
                      <div>
                        <span className="font-medium">Phone:</span> {selectedHospital.phoneNumber}
                      </div>
                    )}
                    {selectedHospital.licenseNumber && (
                      <div>
                        <span className="font-medium">License:</span> {selectedHospital.licenseNumber}
                      </div>
                    )}
                    {selectedHospital.contactPersonName && (
                      <div>
                        <span className="font-medium">Contact Person:</span> {selectedHospital.contactPersonName}
                      </div>
                    )}
                    {selectedHospital.contactPersonEmail && (
                      <div>
                        <span className="font-medium">Contact Email:</span> {selectedHospital.contactPersonEmail}
                      </div>
                    )}
                    {selectedHospital.verificationDocuments && (
                      <div>
                        <span className="font-medium">Documents:</span> {selectedHospital.verificationDocuments}
                      </div>
                    )}
                    {selectedHospital.verificationNotes && (
                      <div>
                        <span className="font-medium">Notes:</span> {selectedHospital.verificationNotes}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Notes (optional)
                    </label>
                    <textarea
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      rows={3}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => handleApprove(selectedHospital.id, true)}
                      disabled={approving}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleApprove(selectedHospital.id, false)}
                      disabled={approving}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        setSelectedHospital(null);
                        setApprovalNotes('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

