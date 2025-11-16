'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { LoginForm } from '@/components/features';
import { ROUTES } from '@/constants';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string>('');

  const handleSubmit = async (email: string, password: string): Promise<boolean> => {
    setError('');
    const result = await login(email, password);
    if (result.success) {
      router.push(ROUTES.DASHBOARD);
      return true;
    } else {
      const errorMessage = result.error || 'Invalid credentials. Please try again.';
      setError(errorMessage);
      // Show error in toast notification
      toast.error(errorMessage, {
        autoClose: 5000,
        position: 'top-right',
      });
      return false;
    }
  };

  return (
    <LoginForm
      title="Sign in to SCIS"
      subtitle="Smart Connected Integrated System"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      footerContent={
        <div>
          <p className="text-sm text-gray-600">
            Don't have an account?
          </p>
          <a
            href={ROUTES.REGISTER_HOSPITAL}
            className="mt-2 inline-block text-sm text-primary-600 hover:text-primary-800 font-medium"
          >
            Register Your Hospital
          </a>
        </div>
      }
    />
  );
}
