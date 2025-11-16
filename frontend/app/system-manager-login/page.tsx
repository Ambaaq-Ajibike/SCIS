'use client';

import React from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/features';
import { Button } from '@/components/ui';
import { Shield } from 'lucide-react';
import { ROUTES, USER_ROLES } from '@/constants';

export default function SystemManagerLoginPage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (email: string, password: string): Promise<boolean> => {
    const success = await login(email, password);
    if (success) {
      // Check if user is System Manager
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === USER_ROLES.SYSTEM_MANAGER) {
        router.push('/system-manager');
        return true;
      } else {
        // Logout the user since they don't have the right role
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      }
    }
    return false;
  };

  const icon = (
    <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
      <Shield className="h-8 w-8 text-white" />
    </div>
  );

  return (
    <LoginForm
      title="System Manager Login"
      subtitle="Access system-wide analytics and monitoring"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error="Access denied. System Manager role required."
      icon={icon}
      footerContent={
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Need different access?</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(ROUTES.LOGIN)}
              className="w-full"
            >
              Hospital Login
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(ROUTES.PATIENT_LOGIN)}
              className="w-full"
            >
              Patient Login
            </Button>
          </div>
        </div>
      }
    />
  );
}
