'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { feedbackService, mlService } from '@/lib/api';

const feedbackSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
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
  hospitalName: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientId: string;
}

export default function FeedbackPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Mock data - in real app, fetch from API
      setDoctors([
        { id: '1', firstName: 'Dr. Sarah', lastName: 'Johnson', specialty: 'Cardiology', hospitalName: 'City General Hospital' },
        { id: '2', firstName: 'Dr. Michael', lastName: 'Chen', specialty: 'Neurology', hospitalName: 'Metro Medical Center' },
        { id: '3', firstName: 'Dr. Emily', lastName: 'Davis', specialty: 'Pediatrics', hospitalName: 'Regional Health Center' },
      ]);

      setPatients([
        { id: '1', firstName: 'John', lastName: 'Doe', patientId: 'P001' },
        { id: '2', firstName: 'Jane', lastName: 'Smith', patientId: 'P002' },
        { id: '3', firstName: 'Bob', lastName: 'Wilson', patientId: 'P003' },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const onSubmit = async (data: FeedbackFormData) => {
    setSubmitting(true);
    setSubmissionResult(null);

    try {
      // Submit feedback
      const response = await feedbackService.submitFeedback(data);
      
      // Analyze sentiment if text feedback provided
      let sentiment = 'Neutral';
      if (data.textFeedback) {
        const sentimentResult = await mlService.analyzeSentiment(data.textFeedback);
        sentiment = sentimentResult.sentiment;
      }

      setSubmissionResult({
        success: true,
        message: 'Feedback submitted successfully!',
        tes: response.treatmentEvaluationScore,
        sentiment,
      });
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

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Patient Feedback Submission</h1>
              
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

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Patient Selection */}
                <div>
                  <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">
                    Patient
                  </label>
                  <select
                    {...register('patientId')}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">Select a patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName} ({patient.patientId})
                      </option>
                    ))}
                  </select>
                  {errors.patientId && (
                    <p className="mt-1 text-sm text-red-600">{errors.patientId.message}</p>
                  )}
                </div>

                {/* Doctor Selection */}
                <div>
                  <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">
                    Doctor
                  </label>
                  <select
                    {...register('doctorId')}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">Select a doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.firstName} {doctor.lastName} - {doctor.specialty} ({doctor.hospitalName})
                      </option>
                    ))}
                  </select>
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Describe the treatment received..."
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
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
      </Layout>
    </ProtectedRoute>
  );
}
