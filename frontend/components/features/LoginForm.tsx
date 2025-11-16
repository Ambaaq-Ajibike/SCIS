/**
 * Reusable Login Form component
 */

import React, { useState } from 'react';
import { Button, Input, PasswordInput, Alert } from '@/components/ui';
import { Building2 } from 'lucide-react';

export interface LoginFormProps {
  title: string;
  subtitle?: string;
  onSubmit: (email: string, password: string) => Promise<boolean>;
  isLoading?: boolean;
  error?: string;
  footerContent?: React.ReactNode;
  emailLabel?: string;
  passwordLabel?: string;
  submitLabel?: string;
  icon?: React.ReactNode;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  title,
  subtitle,
  onSubmit,
  isLoading = false,
  error,
  footerContent,
  emailLabel = 'Email address',
  passwordLabel = 'Password',
  submitLabel = 'Sign in',
  icon,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    const success = await onSubmit(email, password);
    // Don't set localError here - let the parent component handle error display via error prop
    // This ensures the backend error message is properly displayed
  };

  // Prioritize error prop over localError
  const displayError = error || localError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            {icon || <Building2 className="h-12 w-12 text-primary-600" />}
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label={emailLabel}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={emailLabel}
            />
            <PasswordInput
              label={passwordLabel}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={passwordLabel}
            />
          </div>
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
          >
            {submitLabel}
          </Button>

          {footerContent && (
            <div className="text-center">
              {footerContent}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

