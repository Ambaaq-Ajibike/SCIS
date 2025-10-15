'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, FileText, User, Calendar, Building2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import PatientDataDisplay from '@/components/PatientDataDisplay';

export default function PatientDataPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<string>('');
  const [dataType, setDataType] = useState<string>('');
  const [patientInfo, setPatientInfo] = useState<{
    patientId: string;
    patientName: string;
    hospitalName: string;
  } | null>(null);

  useEffect(() => {
    // Get data from URL parameters
    const responseData = searchParams.get('data');
    const type = searchParams.get('type');
    const patientId = searchParams.get('patientId');
    const patientName = searchParams.get('patientName');
    const hospitalName = searchParams.get('hospitalName');

    if (responseData && type) {
      setData(decodeURIComponent(responseData));
      setDataType(type);
      
      if (patientId && patientName && hospitalName) {
        setPatientInfo({
          patientId: decodeURIComponent(patientId),
          patientName: decodeURIComponent(patientName),
          hospitalName: decodeURIComponent(hospitalName)
        });
      }
    } else {
      // If no data in URL, redirect back to data requests
      router.push('/data-requests');
    }
  }, [searchParams, router]);

  const handleDownload = () => {
    if (!data) return;
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-data-${dataType.toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    router.push('/data-requests');
  };

  if (!data || !dataType) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading patient data...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Data Requests
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Patient Data</h1>
                  <p className="text-gray-600">FHIR-compliant patient data response</p>
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </button>
            </div>
          </div>

          {/* Patient Info Card */}
          {patientInfo && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 text-primary-600 mr-2" />
                Patient Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Patient Name</p>
                    <p className="text-sm text-gray-900">{patientInfo.patientName}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Patient ID</p>
                    <p className="text-sm text-gray-900">{patientInfo.patientId}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Hospital</p>
                    <p className="text-sm text-gray-900">{patientInfo.hospitalName}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Type Info */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 text-primary-600 mr-2" />
              Data Type Information
            </h2>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-500">Data Type</p>
                <p className="text-sm text-gray-900 capitalize">{dataType.replace(/([A-Z])/g, ' $1').trim()}</p>
              </div>
            </div>
          </div>

          {/* Data Display */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 text-primary-600 mr-2" />
              FHIR Data Response
            </h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <PatientDataDisplay data={data} dataType={dataType} />
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
