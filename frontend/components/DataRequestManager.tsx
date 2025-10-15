'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  FileText,
  User,
  Building2,
  Calendar,
  Eye,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { dataRequestService } from '@/lib/api';
import PatientDataDisplay from './PatientDataDisplay';

interface PendingDataRequest {
  id: string;
  patientName: string;
  patientId: string;
  requestingHospitalName: string;
  dataType: string;
  purpose?: string;
  requestDate: string;
  requestingUserName: string;
}

interface DataRequestHistory {
  id: string;
  status: string;
  responseData?: string;
  denialReason?: string;
  requestDate: string;
  responseDate?: string;
  approvalDate?: string;
  responseTimeMs: number;
  isConsentValid: boolean;
  isRoleAuthorized: boolean;
  isCrossHospitalRequest: boolean;
  requestingHospitalName?: string;
  patientHospitalName?: string;
  patientName?: string;
  patientId?: string;
  approvingUserName?: string;
}

interface DataRequestManagerProps {
  userRole: string;
}

export default function DataRequestManager({ userRole }: DataRequestManagerProps) {
  const [pendingRequests, setPendingRequests] = useState<PendingDataRequest[]>([]);
  const [requestHistory, setRequestHistory] = useState<DataRequestHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PendingDataRequest | null>(null);
  const [approvalReason, setApprovalReason] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [selectedData, setSelectedData] = useState<string>('');
  const [selectedDataType, setSelectedDataType] = useState<string>('');
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pending, history] = await Promise.all([
        dataRequestService.getPendingRequests(),
        dataRequestService.getRequestHistory()
      ]);
      setPendingRequests(pending);
      setRequestHistory(history);
    } catch (error) {
      console.error('Error fetching data requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string, isApproved: boolean) => {
    setApprovingRequestId(requestId);
    
    try {
      const response = await dataRequestService.approveRequest({
        requestId,
        isApproved,
        reason: approvalReason
      });
      
      if (isApproved) {
        toast.success(`Request approved successfully! Data has been retrieved and is ready for viewing.`);
      } else {
        toast.info(`Request denied. The requesting hospital has been notified.`);
      }
      
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setApprovalReason('');
      await fetchData();
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error(`Failed to ${isApproved ? 'approve' : 'deny'} request: ${error.response?.data?.message || error.message}`);
    } finally {
      setApprovingRequestId(null);
    }
  };

  const openApprovalModal = (request: PendingDataRequest) => {
    setSelectedRequest(request);
    setShowApprovalModal(true);
  };

  const openDataModal = (data: string, dataType: string) => {
    setSelectedData(data);
    setSelectedDataType(dataType);
    setShowDataModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests Section */}
      {userRole === 'HospitalManager' && pendingRequests.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                Pending Data Requests ({pendingRequests.length})
              </h3>
            </div>
            
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-1" />
                          {request.patientName} ({request.patientId})
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Building2 className="h-4 w-4 mr-1" />
                          {request.requestingHospitalName}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(request.requestDate)}
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {request.dataType}
                        </span>
                      </div>
                      
                      {request.purpose && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Purpose:</strong> {request.purpose}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-500">
                        Requested by: {request.requestingUserName}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => openApprovalModal(request)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Request History Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 text-gray-500 mr-2" />
            Data Request History
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hospital
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                {requestHistory.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.patientName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {request.patientId || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.isCrossHospitalRequest ? (
                          <>
                            <div>From: {request.requestingHospitalName}</div>
                            <div>To: {request.patientHospitalName}</div>
                          </>
                        ) : (
                          request.requestingHospitalName || 'Same Hospital'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(request.status)}
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      {request.denialReason && (
                        <div className="text-xs text-red-600 mt-1">
                          {request.denialReason}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(request.requestDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.responseTimeMs > 0 ? `${request.responseTimeMs}ms` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.responseData && (
                        <button
                          onClick={() => openDataModal(request.responseData!, 'LabResults')}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View Data
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Review Data Request
              </h3>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Patient:</strong> {selectedRequest.patientName} ({selectedRequest.patientId})
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Requesting Hospital:</strong> {selectedRequest.requestingHospitalName}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Data Type:</strong> {selectedRequest.dataType}
                </div>
                {selectedRequest.purpose && (
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Purpose:</strong> {selectedRequest.purpose}
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  <strong>Requested by:</strong> {selectedRequest.requestingUserName}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (optional)
                </label>
                <textarea
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Enter reason for approval or denial..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleApproveRequest(selectedRequest.id, true)}
                  disabled={approvingRequestId === selectedRequest.id}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {approvingRequestId === selectedRequest.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  {approvingRequestId === selectedRequest.id ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleApproveRequest(selectedRequest.id, false)}
                  disabled={approvingRequestId === selectedRequest.id}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {approvingRequestId === selectedRequest.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  {approvingRequestId === selectedRequest.id ? 'Denying...' : 'Deny'}
                </button>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedRequest(null);
                    setApprovalReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Display Modal */}
      {showDataModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Patient Data Response
                </h3>
                <button
                  onClick={() => {
                    setShowDataModal(false);
                    setSelectedData('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                <PatientDataDisplay data={selectedData} dataType={selectedDataType} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
