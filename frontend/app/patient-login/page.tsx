'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePatientAuth } from '@/lib/patientAuth';
import { patientAuthService } from '@/lib/api';
import { PatientLoginForm } from '@/components/features';
import { toast } from 'react-toastify';
import { ROUTES } from '@/constants';
import { getApiErrorMessage } from '@/utils/errorHandler';

export default function PatientLoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = usePatientAuth();
  const router = useRouter();

  const handleSubmit = async (
    patientId: string,
    password: string,
    confirmPassword?: string
  ): Promise<boolean> => {
    setError('');

    if (confirmPassword) {
      // Signup mode
      setIsSubmitting(true);
      try {
        const data = await patientAuthService.completeSignup({
          patientId,
          password,
          confirmPassword,
        });
        
        localStorage.setItem('patientToken', data.token);
        localStorage.setItem('patient', JSON.stringify(data.patient));
        toast.success('Registration completed successfully! You are now logged in.', {
          autoClose: 4000,
        });
        router.push(ROUTES.FEEDBACK);
        return true;
      } catch (err) {
        setError(getApiErrorMessage(err));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Login mode
      const success = await login(patientId, password);
      if (success) {
        router.push(ROUTES.FEEDBACK);
        return true;
      }
      return false;
    }
  };

  return (
    <PatientLoginForm
      onSubmit={handleSubmit}
      isLoading={isLoading || isSubmitting}
      error={error}
    />
  );
}
