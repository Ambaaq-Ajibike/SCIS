'use client';

import { useState, useEffect } from 'react';
import { Plus, UserX, AlertCircle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { SearchBar, Select, Button, LoadingSpinner } from '@/components/ui';
import { PatientCard, PatientFormModal } from '@/components/features';
import { patientService, type Patient, type CreatePatientDto, type UpdatePatientDto } from '@/lib/api';
import { toast } from 'react-toastify';
import { useDebounce } from '@/hooks/useDebounce';
import { STATUS } from '@/constants';
import { getApiErrorMessage } from '@/utils/errorHandler';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(STATUS.ALL);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [showEditPatient, setShowEditPatient] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [debouncedSearchTerm]);

  const fetchPatients = async () => {
    try {
      const data = await patientService.getPatients(debouncedSearchTerm || undefined);
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (patientData: CreatePatientDto) => {
    setSubmitting(true);
    try {
      const newPatient = await patientService.createPatient(patientData);
      setPatients(prev => [...prev, newPatient]);
      setShowAddPatient(false);
      toast.success('Patient created successfully! An email has been sent to complete signup.', {
        autoClose: 5000,
      });
    } catch (error) {
      console.error('Error creating patient:', error);
      toast.error(`Error: ${getApiErrorMessage(error)}`, {
        autoClose: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePatient = async (patientData: CreatePatientDto) => {
    if (!selectedPatient) return;
    
    setSubmitting(true);
    try {
      const updateData: UpdatePatientDto = {
        ...patientData,
        isActive: selectedPatient.isActive || true
      };
      const updatedPatient = await patientService.updatePatient(selectedPatient.patientId, updateData);
      setPatients(prev => prev.map(p => p.patientId === selectedPatient.patientId ? updatedPatient : p));
      setShowEditPatient(false);
      setSelectedPatient(null);
      toast.success('Patient updated successfully!', {
        autoClose: 4000,
      });
    } catch (error) {
      console.error('Error updating patient:', error);
      toast.error(`Error: ${getApiErrorMessage(error)}`, {
        autoClose: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deletePatient = async (patientId: string) => {
    const patient = patients.find(p => p.patientId === patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'this patient';
    
    const confirmToast = toast(
      <div className="flex flex-col space-y-3">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          <span className="font-medium">Confirm Deactivation</span>
        </div>
        <p className="text-sm text-gray-600">
          Are you sure you want to deactivate <strong>{patientName}</strong>?
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              toast.dismiss(confirmToast);
              performDeletePatient(patientId);
            }}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Yes, Deactivate
          </button>
          <button
            onClick={() => toast.dismiss(confirmToast)}
            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        autoClose: 10000,
        style: {
          minWidth: '300px',
        },
      }
    );
  };

  const performDeletePatient = async (patientId: string) => {
    try {
      await patientService.deletePatient(patientId);
      setPatients(prev => prev.map(p => 
        p.patientId === patientId ? { ...p, isActive: false } : p
      ));
      toast.success('Patient deactivated successfully!', {
        autoClose: 4000,
      });
    } catch (error: any) {
      console.error('Error deleting patient:', error);
      toast.error(`Error: ${error.response?.data?.message || 'Failed to deactivate patient'}`, {
        autoClose: 5000,
      });
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowEditPatient(true);
  };

  const filteredPatients = patients.filter(patient => {
    const searchLower = debouncedSearchTerm.toLowerCase();
    const matchesSearch = debouncedSearchTerm === '' || 
      patient.firstName.toLowerCase().includes(searchLower) ||
      patient.lastName.toLowerCase().includes(searchLower) ||
      patient.patientId.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === STATUS.ALL || 
      (statusFilter === STATUS.ACTIVE && patient.isActive) ||
      (statusFilter === STATUS.INACTIVE && !patient.isActive);

    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: STATUS.ALL, label: 'All Statuses' },
    { value: STATUS.ACTIVE, label: STATUS.ACTIVE },
    { value: STATUS.INACTIVE, label: STATUS.INACTIVE },
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <LoadingSpinner fullScreen text="Loading patients..." />
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['HospitalManager']}>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
                <p className="text-gray-600">Manage patient records and consent</p>
              </div>
              <Button
                onClick={() => setShowAddPatient(true)}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Patient
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 bg-white shadow rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by name or patient ID..."
              />
              <Select
                label="Status"
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Patients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onEdit={handleEditPatient}
                onDelete={deletePatient}
              />
            ))}
          </div>

          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <UserX className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}

          {/* Patient Modals */}
          <PatientFormModal
            isOpen={showAddPatient}
            onClose={() => setShowAddPatient(false)}
            onSubmit={handleCreatePatient}
            isLoading={submitting}
          />
          <PatientFormModal
            isOpen={showEditPatient}
            onClose={() => {
              setShowEditPatient(false);
              setSelectedPatient(null);
            }}
            onSubmit={handleUpdatePatient}
            patient={selectedPatient}
            isLoading={submitting}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
