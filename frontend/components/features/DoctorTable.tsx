/**
 * Reusable Doctor Table component
 */

import React from 'react';
import { DoctorCard, DoctorCardProps } from './DoctorCard';

export interface DoctorTableProps {
  doctors: DoctorCardProps[];
  searchTerm?: string;
}

export const DoctorTable: React.FC<DoctorTableProps> = ({
  doctors,
  searchTerm = '',
}) => {
  const filteredDoctors = doctors.filter(doctor => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      doctor.doctorName.toLowerCase().includes(searchLower) ||
      doctor.email.toLowerCase().includes(searchLower) ||
      doctor.specialty.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doctor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Specialty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patients
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Requests
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Feedbacks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg TES
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDoctors.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                  {searchTerm ? 'No doctors found matching your search.' : 'No doctors found. Add your first doctor to get started.'}
                </td>
              </tr>
            ) : (
              filteredDoctors.map((doctor) => (
                <DoctorCard key={doctor.doctorId} {...doctor} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

