'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, Loader2, CheckCircle, AlertCircle, Search, User, Building2, LogOut } from 'lucide-react';
import { feedbackService, mlService } from '@/lib/api';
import { usePatientAuth } from '@/lib/patientAuth';
import { useRouter } from 'next/navigation';

const feedbackSchema = z.object({
  doctorId: z.string().min(1, 'Doctor is required'),
  treatmentDescription: z.string().optional(),
  preTreatmentRating: z.number().min(1).max(5),
  postTreatmentRating: z.number().min(1).max(5),
  satisfactionRating: z.number().min(1).max(5),
  textFeedback: z.string().optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  hospitalId: string;
  hospitalName: string;
  isActive: boolean;
}

export default function FeedbackPage() {
  const { patient, isAuthenticated, logout, isLoading: authLoading } = usePatientAuth();
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    message: string;
    tes?: number;
    sentiment?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      preTreatmentRating: 0,
      postTreatmentRating: 0,
      satisfactionRating: 0,
    },
  });

  const watchedRatings = watch(['preTreatmentRating', 'postTreatmentRating', 'satisfactionRating']);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/patient-login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch doctors for the patient's hospital
  useEffect(() => {
    if (isAuthenticated && patient) {
      fetchPatientHospitalDoctors();
    }
  }, [isAuthenticated, patient]);

  useEffect(() => {
    if (searchTerm.length > 2 && doctors.length > 0) {
      const filtered = doctors.filter(doctor =>
        `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDoctors(filtered);
      setShowDoctorDropdown(true);
    } else {
      setFilteredDoctors([]);
      setShowDoctorDropdown(false);
    }
  }, [searchTerm, doctors]);

  const fetchPatientHospitalDoctors = async () => {
    try {
      setLoading(true);
      const doctorsData = await feedbackService.getPatientHospitalDoctors();
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/patient-login');
  };

  const selectDoctor = (doctor: Doctor) => {
    setValue('doctorId', doctor.id);
    setSearchTerm(`${doctor.firstName} ${doctor.lastName} - ${doctor.specialty} (${doctor.hospitalName})`);
    setShowDoctorDropdown(false);
  };

  const onSubmit = async (data: FeedbackFormData) => {
    setSubmitting(true);
    setSubmissionResult(null);

    try {
      // Validate that all required fields are filled
      if (!data.doctorId || data.preTreatmentRating === 0 || data.postTreatmentRating === 0 || data.satisfactionRating === 0) {
        setSubmissionResult({
          success: false,
          message: 'Please fill in all required fields including ratings.',
        });
        setSubmitting(false);
        return;
      }

      // Submit feedback (patientId will be set from JWT token on backend)
      const response = await feedbackService.submitFeedback({
        ...data,
        patientId: patient?.id || '', // This will be overridden by backend
      });
      
      // Analyze sentiment if text feedback provided
      let sentiment = 'Neutral';
      if (data.textFeedback && data.textFeedback.trim()) {
        const sentimentResult = await mlService.analyzeSentiment(data.textFeedback);
        sentiment = sentimentResult.sentiment;
      }

      setSubmissionResult({
        success: true,
        message: 'Feedback submitted successfully!',
        tes: response.treatmentEvaluationScore,
        sentiment,
      });

      // Reset form after successful submission
      setValue('doctorId', '');
      setValue('preTreatmentRating', 0);
      setValue('postTreatmentRating', 0);
      setValue('satisfactionRating', 0);
      setValue('treatmentDescription', '');
      setValue('textFeedback', '');
      setSearchTerm('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmissionResult({
        success: false,
        message: 'Failed to submit feedback. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (value: number) => void; 
    label: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // Show login redirect if not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">SCIS</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Patient Feedback System
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Submit Your Feedback</h1>
            
            {submissionResult && (
              <div className={`mb-6 p-4 rounded-md ${
                submissionResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {submissionResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      submissionResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {submissionResult.message}
                    </p>
                    {submissionResult.tes && (
                      <p className="text-sm text-green-700 mt-1">
                        Treatment Evaluation Score: {submissionResult.tes.toFixed(1)}%
                      </p>
                    )}
                    {submissionResult.sentiment && (
                      <p className="text-sm text-green-700 mt-1">
                        Sentiment Analysis: {submissionResult.sentiment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Patient Confirmation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="font-medium text-blue-900">
                    {patient?.firstName} {patient?.lastName}
                  </p>
                  <p className="text-sm text-blue-700">
                    Patient ID: {patient?.patientId} • {patient?.hospitalName}
                  </p>
                </div>
              </div>
            </div>

            {/* Feedback Form */}
            <div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Doctor Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor
                  </label>
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for your doctor by name or specialty..."
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                    
                    {showDoctorDropdown && filteredDoctors.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                        {filteredDoctors.map((doctor) => (
                          <button
                            key={doctor.id}
                            type="button"
                            onClick={() => selectDoctor(doctor)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100"
                          >
                            <div className="font-medium text-gray-900">
                              {doctor.firstName} {doctor.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {doctor.specialty}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.doctorId && (
                    <p className="mt-1 text-sm text-red-600">{errors.doctorId.message}</p>
                  )}
                </div>

                {/* Treatment Description */}
                <div>
                  <label htmlFor="treatmentDescription" className="block text-sm font-medium text-gray-700">
                    Treatment Description (Optional)
                  </label>
                  <textarea
                    {...register('treatmentDescription')}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Describe the treatment you received..."
                  />
                </div>

                {/* Ratings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StarRating
                    value={watchedRatings[0]}
                    onChange={(value) => setValue('preTreatmentRating', value)}
                    label="Pre-Treatment Rating"
                  />
                  <StarRating
                    value={watchedRatings[1]}
                    onChange={(value) => setValue('postTreatmentRating', value)}
                    label="Post-Treatment Rating"
                  />
                  <StarRating
                    value={watchedRatings[2]}
                    onChange={(value) => setValue('satisfactionRating', value)}
                    label="Overall Satisfaction"
                  />
                </div>

                {/* Text Feedback */}
                <div>
                  <label htmlFor="textFeedback" className="block text-sm font-medium text-gray-700">
                    Additional Feedback (Optional)
                  </label>
                  <textarea
                    {...register('textFeedback')}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Share your experience, suggestions, or any additional comments..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Your feedback will be analyzed for sentiment and used to improve healthcare services.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Feedback'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}