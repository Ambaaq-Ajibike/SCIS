'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { LoginForm } from '@/components/features';
import { ROUTES } from '@/constants';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (email: string, password: string): Promise<boolean> => {
    const success = await login(email, password);
    if (success) {
      router.push(ROUTES.DASHBOARD);
      return true;
    }
    return false;
  };

  return (
    <LoginForm
      title="Sign in to SCIS"
      subtitle="Smart Connected Integrated System"
      onSubmit={handleSubmit}
      isLoading={isLoading}
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
