'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, User, Activity } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { SearchBar, Button, LoadingSpinner } from '@/components/ui';
import { DoctorTable, StatCard } from '@/components/features';
import { dashboardService } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import { ROUTES } from '@/constants';

interface Doctor {
  doctorId: string;
  doctorName: string;
  email: string;
  specialty: string;
  hospitalId: string;
  hospitalName: string;
  isActive: boolean;
  totalPatients: number;
  totalDataRequests: number;
  totalFeedbacks: number;
  averageTreatmentEvaluationScore: number;
  averageSentimentScore: number;
  lastActivity: string;
}

export default function DoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearchTerm = useDebounce(searchTerm);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const doctorsData = await dashboardService.getDoctors();
      
      // Map the data to Doctor interface
      const mappedDoctors: Doctor[] = doctorsData.map((d: any) => ({
        doctorId: d.doctorId || d.id,
        doctorName: d.doctorName || d.username || d.firstName || 'Unknown',
        email: d.email || '',
        specialty: d.specialty || 'General Medicine',
        hospitalId: d.hospitalId || '',
        hospitalName: d.hospitalName || '',
        isActive: d.isActive !== undefined ? d.isActive : true,
        totalPatients: d.totalPatients || 0,
        totalDataRequests: d.totalDataRequests || 0,
        totalFeedbacks: d.totalFeedbacks || 0,
        averageTreatmentEvaluationScore: d.averageTreatmentEvaluationScore || 0,
        averageSentimentScore: d.averageSentimentScore || 0,
        lastActivity: d.lastActivity || d.createdAt || ''
      }));

      setDoctors(mappedDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['HospitalManager']}>
        <Layout>
          <LoadingSpinner fullScreen text="Loading doctors..." />
        </Layout>
      </ProtectedRoute>
    );
  }

  const doctorTableData = doctors.map(d => ({
    doctorId: d.doctorId,
    doctorName: d.doctorName,
    email: d.email,
    specialty: d.specialty,
    totalPatients: d.totalPatients,
    totalDataRequests: d.totalDataRequests,
    totalFeedbacks: d.totalFeedbacks,
    averageTreatmentEvaluationScore: d.averageTreatmentEvaluationScore,
    isActive: d.isActive,
  }));

  const averageTES = doctors.length > 0
    ? doctors.reduce((sum, d) => sum + d.averageTreatmentEvaluationScore, 0) / doctors.length
    : 0;

  const totalPatients = doctors.reduce((sum, d) => sum + d.totalPatients, 0);

  return (
    <ProtectedRoute allowedRoles={['HospitalManager']}>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
                <p className="mt-2 text-gray-600">Manage doctors in your hospital</p>
              </div>
              <Button
                onClick={() => router.push(`${ROUTES.DOCTORS}/create`)}
                leftIcon={<UserPlus className="h-4 w-4" />}
              >
                Add Doctor
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6 bg-white shadow rounded-lg p-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search doctors by name, email, or specialty..."
            />
          </div>

          {/* Doctors Table */}
          <DoctorTable doctors={doctorTableData} searchTerm={debouncedSearchTerm} />

          {/* Summary Stats */}
          {doctors.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Doctors"
                value={doctors.length}
                icon={User}
                iconColor="text-blue-600"
              />
              <StatCard
                title="Average TES"
                value={`${averageTES.toFixed(1)}%`}
                icon={Activity}
                iconColor="text-green-600"
              />
              <StatCard
                title="Total Patients"
                value={totalPatients}
                icon={User}
                iconColor="text-purple-600"
              />
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

