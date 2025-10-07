'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Patient, patientAuthService } from './api';

interface PatientAuthContextType {
  patient: Patient | null;
  token: string | null;
  login: (patientId: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const PatientAuthContext = createContext<PatientAuthContextType | undefined>(undefined);

export const usePatientAuth = () => {
  const context = useContext(PatientAuthContext);
  if (context === undefined) {
    throw new Error('usePatientAuth must be used within a PatientAuthProvider');
  }
  return context;
};

export const PatientAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('patientToken');
      const storedPatient = localStorage.getItem('patient');

      if (storedToken && storedPatient) {
        try {
          const isValid = await patientAuthService.validateToken();
          if (isValid) {
            setToken(storedToken);
            setPatient(JSON.parse(storedPatient));
          } else {
            localStorage.removeItem('patientToken');
            localStorage.removeItem('patient');
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('patientToken');
          localStorage.removeItem('patient');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (patientId: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await patientAuthService.login({ patientId, password });
      
      setToken(response.token);
      setPatient(response.patient);
      
      localStorage.setItem('patientToken', response.token);
      localStorage.setItem('patient', JSON.stringify(response.patient));
      
      return true;
    } catch (error) {
      console.error('Patient login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await patientAuthService.logout();
    } catch (error) {
      console.error('Patient logout error:', error);
    } finally {
      setToken(null);
      setPatient(null);
      localStorage.removeItem('patientToken');
      localStorage.removeItem('patient');
    }
  };

  const value: PatientAuthContextType = {
    patient,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!patient && !!token,
  };

  return <PatientAuthContext.Provider value={value}>{children}</PatientAuthContext.Provider>;
};
