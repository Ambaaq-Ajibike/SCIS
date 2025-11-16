/**
 * Hospital Filter component for System Manager
 */

import React from 'react';
import { Select, LoadingSpinner } from '@/components/ui';

export interface Hospital {
  hospitalId: string;
  hospitalName: string;
}

export interface HospitalFilterProps {
  hospitals: Hospital[];
  selectedHospitalId: string;
  onHospitalChange: (hospitalId: string) => void;
  isLoading?: boolean;
}

export const HospitalFilter: React.FC<HospitalFilterProps> = ({
  hospitals,
  selectedHospitalId,
  onHospitalChange,
  isLoading = false,
}) => {
  const hospitalOptions = [
    { value: '', label: 'All Hospitals' },
    ...hospitals.map(h => ({
      value: h.hospitalId,
      label: h.hospitalName,
    })),
  ];

  if (isLoading) {
    return (
      <div className="mb-6 bg-white shadow rounded-lg p-4">
        <div className="flex items-center text-sm text-gray-500">
          <LoadingSpinner size="sm" />
          <span className="ml-2">Loading hospitals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-white shadow rounded-lg p-4">
      <Select
        label="Filter by Hospital"
        options={hospitalOptions}
        value={selectedHospitalId}
        onChange={(e) => onHospitalChange(e.target.value)}
        className="max-w-xs"
      />
      {!isLoading && hospitals.length === 0 && (
        <p className="mt-2 text-sm text-red-600">No hospitals available</p>
      )}
    </div>
  );
};

