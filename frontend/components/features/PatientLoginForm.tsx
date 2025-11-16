/**
 * Patient Login/Registration Form component
 */

import React, { useState, useEffect } from 'react';
import { Input, PasswordInput, Button, Alert } from '@/components/ui';
import { Building2, User } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export interface PatientLoginFormProps {
  onSubmit: (patientId: string, password: string, confirmPassword?: string) => Promise<boolean>;
  isLoading?: boolean;
  error?: string;
}

export const PatientLoginForm: React.FC<PatientLoginFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
}) => {
  const searchParams = useSearchParams();
  const [patientId, setPatientId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    const patientIdParam = searchParams?.get('patientId');
    if (patientIdParam) {
      setPatientId(patientIdParam);
      setIsSignupMode(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!patientId || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (isSignupMode) {
      if (!confirmPassword) {
        setLocalError('Please confirm your password');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters long');
        return;
      }
    }

    const success = await onSubmit(patientId, password, isSignupMode ? confirmPassword : undefined);
    if (!success) {
      setLocalError(error || 'Invalid patient credentials. Please try again.');
    }
  };

  const displayError = error || localError;

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
          <div className="space-y-4">
            <Input
              label="Patient ID"
              type="text"
              autoComplete="username"
              required
              disabled={isSignupMode}
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Patient ID"
              className={isSignupMode ? 'bg-gray-100' : ''}
            />
            <PasswordInput
              label="Password"
              autoComplete={isSignupMode ? 'new-password' : 'current-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            {isSignupMode && (
              <PasswordInput
                label="Confirm Password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
              />
            )}
          </div>

          {displayError && (
            <Alert variant="error" message={displayError} />
          )}

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
          >
            {isSignupMode ? 'Complete Registration' : 'Sign in as Patient'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact your hospital for assistance.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

