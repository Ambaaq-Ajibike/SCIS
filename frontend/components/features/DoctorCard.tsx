/**
 * Reusable Doctor Card component for table rows
 */

import React from 'react';
import { User, Mail } from 'lucide-react';
import { StatusBadge } from '@/components/ui';
import { TES_THRESHOLDS } from '@/constants';

export interface DoctorCardProps {
  doctorId: string;
  doctorName: string;
  email: string;
  specialty: string;
  totalPatients: number;
  totalDataRequests: number;
  totalFeedbacks: number;
  averageTreatmentEvaluationScore: number;
  isActive: boolean;
}

const getTESColor = (tes: number): string => {
  if (tes >= TES_THRESHOLDS.EXCELLENT) return 'text-green-600 font-semibold';
  if (tes >= TES_THRESHOLDS.GOOD) return 'text-yellow-600 font-semibold';
  return 'text-red-600 font-semibold';
};

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctorName,
  email,
  specialty,
  totalPatients,
  totalDataRequests,
  totalFeedbacks,
  averageTreatmentEvaluationScore,
  isActive,
}) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{doctorName}</div>
            <div className="text-sm text-gray-500 flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              {email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{specialty}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{totalPatients}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{totalDataRequests}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{totalFeedbacks}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm ${getTESColor(averageTreatmentEvaluationScore)}`}>
          {averageTreatmentEvaluationScore.toFixed(1)}%
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge
          status={isActive ? 'active' : 'inactive'}
        />
      </td>
    </tr>
  );
};

