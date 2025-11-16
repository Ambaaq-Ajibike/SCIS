/**
 * Reusable Patient Form Modal component
 */

import React from 'react';
import { Modal, Input, Select, Button } from '@/components/ui';
import { Patient, CreatePatientDto } from '@/lib/api';
import { GENDER_OPTIONS } from '@/constants';
import { User, Edit } from 'lucide-react';

export interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePatientDto) => Promise<void>;
  patient?: Patient | null;
  isLoading?: boolean;
}

const genderOptions = [
  { value: '', label: 'Select gender' },
  { value: GENDER_OPTIONS.MALE, label: GENDER_OPTIONS.MALE },
  { value: GENDER_OPTIONS.FEMALE, label: GENDER_OPTIONS.FEMALE },
  { value: GENDER_OPTIONS.OTHER, label: GENDER_OPTIONS.OTHER },
];

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  patient,
  isLoading = false,
}) => {
  const [formData, setFormData] = React.useState<CreatePatientDto>({
    firstName: patient?.firstName || '',
    lastName: patient?.lastName || '',
    dateOfBirth: patient?.dateOfBirth || '',
    gender: patient?.gender || '',
    phoneNumber: patient?.phoneNumber || '',
    email: patient?.email || '',
  });

  React.useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        phoneNumber: patient.phoneNumber || '',
        email: patient.email,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        phoneNumber: '',
        email: '',
      });
    }
  }, [patient, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (field: keyof CreatePatientDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isEditMode = !!patient;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Patient' : 'Add New Patient'}
      subtitle={isEditMode ? 'Update patient information' : 'Create a new patient record'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <Input
            label="First Name"
            required
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="Enter first name"
          />

          <Input
            label="Last Name"
            required
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Enter last name"
          />

          <Input
            label="Date of Birth"
            type="date"
            required
            value={formData.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          />

          <Select
            label="Gender"
            required
            options={genderOptions}
            value={formData.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
          />

          <Input
            label="Phone Number"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            placeholder="Enter phone number"
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter email address"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            leftIcon={isEditMode ? <Edit className="h-4 w-4" /> : <User className="h-4 w-4" />}
          >
            {isEditMode ? 'Update Patient' : 'Add Patient'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

