'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePatientAuth } from '@/lib/patientAuth';
import { patientAuthService } from '@/lib/api';
import { Building2, Eye, EyeOff, Loader2, User, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function PatientLoginPage() {
  const [patientId, setPatientId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isLoading } = usePatientAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const patientIdParam = searchParams.get('patientId');
    if (patientIdParam) {
      setPatientId(patientIdParam);
      setIsSignupMode(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!patientId || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignupMode) {
      if (!confirmPassword) {
        setError('Please confirm your password');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      setIsSubmitting(true);
      try {
        const data = await patientAuthService.completeSignup({
          patientId,
          password,
          confirmPassword
        });
        
        localStorage.setItem('patientToken', data.token);
        localStorage.setItem('patient', JSON.stringify(data.patient));
        toast.success('Registration completed successfully! You are now logged in.', {
          autoClose: 4000,
        });
        router.push('/feedback');
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to complete registration. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const success = await login(patientId, password);
      if (success) {
        router.push('/feedback');
      } else {
        setError('Invalid patient credentials. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="flex items-center">
              <Building2 className="h-12 w-12 text-primary-600" />
              <User className="h-8 w-8 text-primary-600 ml-2" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignupMode ? 'Complete Registration' : 'Patient Login'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignupMode 
              ? 'Set your password to complete your patient registration'
              : 'Sign in to submit your feedback'
            }
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="patientId" className="sr-only">
                Patient ID
              </label>
              <input
                id="patientId"
                name="patientId"
                type="text"
                autoComplete="username"
                required
                disabled={isSignupMode}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${isSignupMode ? 'rounded-t-md' : 'rounded-t-md'} focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm ${isSignupMode ? 'bg-gray-100' : ''}`}
                placeholder="Patient ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSignupMode ? 'new-password' : 'current-password'}
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 ${isSignupMode ? 'rounded-none' : 'rounded-b-md'} focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {isSignupMode && (
              <div className="relative">
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isLoading || isSubmitting) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                isSignupMode ? 'Complete Registration' : 'Sign in as Patient'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact your hospital for assistance.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
