'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { onboardingService } from '@/lib/api';
import { Input } from '@/components/ui/Input';

export default function CreateDoctorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    specialty: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onboardingService.createDoctor({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        specialty: formData.specialty || undefined
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/doctors');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create doctor. Please try again.');
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['HospitalManager']}>
      <Layout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center">
              <UserPlus className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Add Doctor</h1>
                <p className="mt-2 text-gray-600">Create a new doctor account for your hospital</p>
              </div>
            </div>
          </div>

          {success ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor Created Successfully!</h2>
              <p className="text-gray-600">Redirecting to doctors list...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
              <Input
                type="text"
                name="username"
                id="username"
                label="Username"
                required
                value={formData.username}
                onChange={handleChange}
              />

              <Input
                type="email"
                name="email"
                id="email"
                label="Email"
                required
                value={formData.email}
                onChange={handleChange}
              />

              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                label="Password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
              />

              <Input
                type="text"
                name="specialty"
                id="specialty"
                label="Specialty"
                value={formData.specialty}
                onChange={handleChange}
                placeholder="e.g., Cardiology, Pediatrics"
              />

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </span>
                  ) : (
                    'Create Doctor'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

