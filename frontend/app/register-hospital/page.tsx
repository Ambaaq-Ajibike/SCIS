'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { onboardingService } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function RegisterHospitalPage() {
  const router = useRouter();
  const { login: setAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    hospitalName: '',
    address: '',
    phoneNumber: '',
    email: '',
    licenseNumber: '',
    managerUsername: '',
    managerEmail: '',
    managerPassword: '',
    contactPersonName: '',
    contactPersonEmail: '',
    contactPersonPhone: '',
    verificationDocuments: '',
    verificationNotes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        email: formData.email,
        licenseNumber: formData.licenseNumber || undefined,
        managerUsername: formData.managerUsername,
        managerEmail: formData.managerEmail,
        managerPassword: formData.managerPassword,
        contactPersonName: formData.contactPersonName,
        contactPersonEmail: formData.contactPersonEmail,
        contactPersonPhone: formData.contactPersonPhone,
        verificationDocuments: formData.verificationDocuments || undefined,
        verificationNotes: formData.verificationNotes || undefined
      });

      // Auto-login after registration
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
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
          <h2 className="text-2xl font-bold text-gray-900">Registration Successful!</h2>
          <p className="text-gray-600">
            Your hospital registration has been submitted. It is pending approval from the system administrator.
            You will be redirected to the dashboard shortly.
          </p>
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
              <div>
                <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700">
                  Hospital Name *
                </label>
                <input
                  type="text"
                  name="hospitalName"
                  id="hospitalName"
                  required
                  value={formData.hospitalName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-4"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-4"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-4"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Hospital Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-4"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                  License Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-4"
                />
              </div>
            </div>
          </div>

          {/* Hospital Manager Account */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Hospital Manager Account</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="managerUsername" className="block text-sm font-medium text-gray-700">
                  Username *
                </label>
                <input
                  type="text"
                  name="managerUsername"
                  id="managerUsername"
                  required
                  value={formData.managerUsername}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-4"
                />
              </div>
              <div>
                <label htmlFor="managerEmail" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  name="managerEmail"
                  id="managerEmail"
                  required
                  value={formData.managerEmail}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-4"
                />
              </div>
              <div className="relative">
                <label htmlFor="managerPassword" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="managerPassword"
                  id="managerPassword"
                  required
                  minLength={6}
                  value={formData.managerPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-3"
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
            </div>
          </div>

          {/* Contact Person */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Person</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="contactPersonName" className="block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  name="contactPersonName"
                  id="contactPersonName"
                  required
                  value={formData.contactPersonName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-4"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactPersonEmail" className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="contactPersonEmail"
                    id="contactPersonEmail"
                    required
                    value={formData.contactPersonEmail}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-4"
                  />
                </div>
                <div>
                  <label htmlFor="contactPersonPhone" className="block text-sm font-medium text-gray-700">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="contactPersonPhone"
                    id="contactPersonPhone"
                    required
                    value={formData.contactPersonPhone}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-4"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Verification Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Verification Details</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="verificationDocuments" className="block text-sm font-medium text-gray-700">
                  Verification Documents (comma-separated or JSON)
                </label>
                <input
                  type="text"
                  name="verificationDocuments"
                  id="verificationDocuments"
                  value={formData.verificationDocuments}
                  onChange={handleChange}
                  placeholder="e.g., license.pdf, certification.pdf"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-4"
                />
              </div>
              <div>
                <label htmlFor="verificationNotes" className="block text-sm font-medium text-gray-700">
                  Additional Notes
                </label>
                <textarea
                  name="verificationNotes"
                  id="verificationNotes"
                  rows={3}
                  value={formData.verificationNotes}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-4"
                />
              </div>
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

