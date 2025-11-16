'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { onboardingService } from '@/lib/api';
import { Input } from '@/components/ui/Input';

export default function RegisterHospitalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    hospitalName: '',
    address: '',
    phoneNumber: '',
    licenseNumber: '',
    managerUsername: '',
    managerEmail: '',
    managerPassword: ''
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
      const response = await onboardingService.registerHospital({
        hospitalName: formData.hospitalName,
        address: formData.address,
        phoneNumber: formData.phoneNumber || undefined,
        licenseNumber: formData.licenseNumber || undefined,
        managerUsername: formData.managerUsername,
        managerEmail: formData.managerEmail,
        managerPassword: formData.managerPassword
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register hospital. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-900">Registration Submitted Successfully!</h2>
          <div className="space-y-4 text-left bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-gray-700 font-medium">
              Your hospital registration has been submitted and is pending approval from the system administrator.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-start">
                <span className="font-semibold mr-2">1.</span>
                <span>Please wait for the system administrator to review and approve your registration.</span>
              </p>
              <p className="flex items-start">
                <span className="font-semibold mr-2">2.</span>
                <span>Once approved, you will receive an email notification at <strong>{formData.managerEmail}</strong>.</span>
              </p>
              <p className="flex items-start">
                <span className="font-semibold mr-2">3.</span>
                <span>After receiving the approval email, you can log in using your credentials to access the dashboard and perform all actions.</span>
              </p>
            </div>
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-center">
            <Building2 className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register Your Hospital
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Complete the form below. Your registration will be reviewed by the system administrator.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          {/* Hospital Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Hospital Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <Input
                type="text"
                name="hospitalName"
                id="hospitalName"
                label="Hospital Name"
                required
                value={formData.hospitalName}
                onChange={handleChange}
              />
              <Input
                type="text"
                name="address"
                id="address"
                label="Address"
                required
                value={formData.address}
                onChange={handleChange}
              />
              <Input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              <Input
                type="text"
                name="licenseNumber"
                id="licenseNumber"
                label="License Number"
                value={formData.licenseNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Hospital Manager Account */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Hospital Manager Account</h3>
            <div className="grid grid-cols-1 gap-4">
              <Input
                type="text"
                name="managerUsername"
                id="managerUsername"
                label="Username"
                required
                value={formData.managerUsername}
                onChange={handleChange}
              />
              <Input
                type="email"
                name="managerEmail"
                id="managerEmail"
                label="Email"
                required
                value={formData.managerEmail}
                onChange={handleChange}
              />
              <Input
                type={showPassword ? 'text' : 'password'}
                name="managerPassword"
                id="managerPassword"
                label="Password"
                required
                minLength={6}
                value={formData.managerPassword}
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
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/login')}
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
                  Registering...
                </span>
              ) : (
                'Register Hospital'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
