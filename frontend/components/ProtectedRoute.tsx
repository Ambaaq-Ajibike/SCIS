'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { onboardingService } from '@/lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('SystemManager' | 'HospitalManager' | 'Doctor' | 'Staff' | 'Patient')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();
  const [checkingApproval, setCheckingApproval] = useState(false);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);

  const checkHospitalApproval = useCallback(async () => {
    if (!isLoading && isAuthenticated && user?.hospitalId && user.role !== 'SystemManager') {
      setCheckingApproval(true);
      try {
        // Use getMyHospital for hospital managers, getHospital for system managers
        const hospital = user.role === 'HospitalManager' 
          ? await onboardingService.getMyHospital()
          : await onboardingService.getHospital(user.hospitalId);
        setIsApproved(hospital.isApproved && hospital.isActive);
        
        // If hospital is not approved, redirect after a moment
        if (!hospital.isApproved || !hospital.isActive) {
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        }
      } catch (error) {
        console.error('Error checking hospital approval:', error);
        setIsApproved(false);
      } finally {
        setCheckingApproval(false);
      }
    } else if (user?.role === 'SystemManager') {
      // System managers don't need hospital approval
      setIsApproved(true);
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Check hospital approval status for hospital users
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      checkHospitalApproval();
    }
  }, [isLoading, isAuthenticated, checkHospitalApproval]);

  if (isLoading || checkingApproval) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Check if hospital is approved (only for non-system managers with hospital)
  if (user?.hospitalId && user.role !== 'SystemManager') {
    if (isApproved === false) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Hospital Not Approved</h1>
            <p className="text-gray-600 mb-6">
              Your hospital registration is pending approval from the system administrator.
              You will be redirected to the login page shortly.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Please contact the system administrator for more information.
            </p>
            <button
              onClick={checkHospitalApproval}
              disabled={checkingApproval}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkingApproval ? 'Checking...' : 'Refresh Status'}
            </button>
          </div>
        </div>
      );
    }
    
    // Still checking approval status
    if (isApproved === null) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      );
    }
  }

  return <>{children}</>;
}
