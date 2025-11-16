/**
 * Reusable Patient Card component
 */

import React from 'react';
import { Patient } from '@/lib/api';
import { Building2, Calendar, Phone, Mail, Edit, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/ui';
import { formatAge, getInitials } from '@/utils/format';

export interface PatientCardProps {
  patient: Patient;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patientId: string) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {getInitials(patient.firstName, patient.lastName)}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                {patient.firstName} {patient.lastName}
              </h3>
              <p className="text-sm text-gray-500">ID: {patient.patientId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(patient)}
                className="text-gray-400 hover:text-gray-600"
                title="Edit Patient"
                aria-label="Edit patient"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(patient.patientId)}
                className="text-gray-400 hover:text-red-600"
                title="Deactivate Patient"
                aria-label="Deactivate patient"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Age: {formatAge(patient.dateOfBirth)} years</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <Building2 className="h-4 w-4 mr-2" />
            <span>{patient.hospitalName}</span>
          </div>

          {patient.phoneNumber && (
            <div className="flex items-center text-sm text-gray-500">
              <Phone className="h-4 w-4 mr-2" />
              <span>{patient.phoneNumber}</span>
            </div>
          )}

          {patient.email && (
            <div className="flex items-center text-sm text-gray-500">
              <Mail className="h-4 w-4 mr-2" />
              <span className="truncate">{patient.email}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center">
              <StatusBadge
                status={patient.isActive ? 'active' : 'inactive'}
                showIcon
              />
            </div>

            <div className="flex items-center">
              <StatusBadge
                status={patient.isSignupCompleted ? 'success' : 'pending'}
                label={patient.isSignupCompleted ? 'Registered' : 'Pending'}
                showIcon
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

