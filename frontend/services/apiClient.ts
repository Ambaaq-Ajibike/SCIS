/**
 * API Client configuration and interceptors
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ROUTES } from '@/constants';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5066/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check for patient token first, then regular token
    const patientToken = typeof window !== 'undefined' ? localStorage.getItem('patientToken') : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (patientToken) {
      config.headers.Authorization = `Bearer ${patientToken}`;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for auth error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Check if it's a patient token or regular token
      const patientToken = localStorage.getItem('patientToken');
      if (patientToken) {
        localStorage.removeItem('patientToken');
        localStorage.removeItem('patient');
        window.location.href = ROUTES.PATIENT_LOGIN;
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = ROUTES.LOGIN;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

