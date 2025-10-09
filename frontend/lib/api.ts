import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7139/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check for patient token first, then regular token
    const patientToken = localStorage.getItem('patientToken');
    const token = localStorage.getItem('token');
    
    if (patientToken) {
      config.headers.Authorization = `Bearer ${patientToken}`;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if it's a patient token or regular token
      const patientToken = localStorage.getItem('patientToken');
      if (patientToken) {
        localStorage.removeItem('patientToken');
        localStorage.removeItem('patient');
        window.location.href = '/patient-login';
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface PatientLoginRequest {
  patientId: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface PatientLoginResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  patient: Patient;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'SystemManager' | 'HospitalManager' | 'Doctor' | 'Staff' | 'Patient';
  hospitalId?: string;
  hospitalName?: string;
}

export interface PatientFeedbackDto {
  patientId: string;
  doctorId: string;
  treatmentDescription?: string;
  preTreatmentRating: number;
  postTreatmentRating: number;
  satisfactionRating: number;
  textFeedback?: string;
}

export interface PatientFeedbackResponse {
  id: string;
  treatmentEvaluationScore: number;
  sentimentAnalysis?: string;
  sentimentScore: number;
  createdAt: string;
}

export interface DataRequestDto {
  patientId: string;
  dataType: string;
  purpose?: string;
}

export interface DataRequestResponse {
  id: string;
  status: string;
  responseData?: string;
  denialReason?: string;
  requestDate: string;
  responseDate?: string;
  responseTimeMs: number;
  isConsentValid: boolean;
  isRoleAuthorized: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  patientId: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber?: string;
  email?: string;
  hospitalId: string;
  hospital: Hospital;
  hospitalName: string;
  isActive: boolean;
  biometricConsent: boolean;
  biometricConsentDate?: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  specialty: string;
  hospitalId: string;
  hospitalName: string;
  isActive: boolean;
}

export interface HospitalDto {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

// API Services
export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  validateToken: async (): Promise<boolean> => {
    try {
      await api.post('/auth/validate');
      return true;
    } catch {
      return false;
    }
  },
};

export const patientAuthService = {
  login: async (credentials: PatientLoginRequest): Promise<PatientLoginResponse> => {
    const response = await api.post('/patientauth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/patientauth/logout');
  },

  validateToken: async (): Promise<boolean> => {
    try {
      await api.post('/patientauth/validate');
      return true;
    } catch {
      return false;
    }
  },
};

export const feedbackService = {
  submitFeedback: async (feedback: PatientFeedbackDto): Promise<PatientFeedbackResponse> => {
    const response = await api.post('/feedback/submit', feedback);
    return response.data;
  },

  getDoctorAverageTES: async (doctorId: string): Promise<{ doctorId: string; averageTES: number }> => {
    const response = await api.get(`/feedback/doctor/${doctorId}/average-tes`);
    return response.data;
  },

  getHospitalAverageTES: async (hospitalId: string): Promise<{ hospitalId: string; averageTES: number }> => {
    const response = await api.get(`/feedback/hospital/${hospitalId}/average-tes`);
    return response.data;
  },

  getPerformanceInsights: async (): Promise<any[]> => {
    const response = await api.get('/feedback/insights');
    return response.data;
  },

  getPatientHospitalDoctors: async (): Promise<Doctor[]> => {
    const response = await api.get('/feedback/patient/doctors');
    console.log({response})
    return response.data;
  },
};

export const dataRequestService = {
  requestData: async (request: DataRequestDto): Promise<DataRequestResponse> => {
    const response = await api.post('/datarequest/request', request);
    return response.data;
  },

  getRequestHistory: async (): Promise<DataRequestResponse[]> => {
    const response = await api.get('/datarequest/history');
    return response.data;
  },
};

export const mlService = {
  performClustering: async (data: any[]): Promise<any[]> => {
    const response = await api.post('/ml/clustering', data);
    return response.data;
  },

  analyzeSentiment: async (text: string): Promise<{ text: string; sentiment: string }> => {
    const response = await api.post('/ml/sentiment', text);
    return response.data;
  },

  forecastPatientVolumes: async (hospitalId: number, days: number = 7): Promise<any[]> => {
    const response = await api.get(`/ml/forecast/${hospitalId}?days=${days}`);
    return response.data;
  },

  calculatePerformanceIndex: async (hospitalId: number): Promise<{ hospitalId: number; performanceIndex: number }> => {
    const response = await api.get(`/ml/performance-index/${hospitalId}`);
    return response.data;
  },

  getPerformanceGaps: async (): Promise<any[]> => {
    const response = await api.get('/ml/gaps');
    return response.data;
  },

  getResourceRecommendations: async (hospitalId: number): Promise<any[]> => {
    const response = await api.get(`/ml/recommendations/${hospitalId}`);
    return response.data;
  },
};

export const patientService = {
  getPatientById: async (patientId: string): Promise<Patient> => {
    const response = await api.get(`/patient/${patientId}`);
    return response.data;
  },
};

export const hospitalService = {
  getHospitals: async (): Promise<HospitalDto[]> => {
    const response = await api.get('/hospital');
    return response.data;
  },

  getDoctorsByHospital: async (hospitalId: string): Promise<Doctor[]> => {
    const response = await api.get(`/hospital/${hospitalId}/doctors`);
    return response.data;
  },
};

export const dashboardService = {
  getDashboardStats: async (): Promise<any> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getHospitalPerformance: async (): Promise<any[]> => {
    const response = await api.get('/dashboard/hospital-performance');
    return response.data;
  },

  getSentimentAnalysis: async (): Promise<any[]> => {
    const response = await api.get('/dashboard/sentiment-analysis');
    return response.data;
  },

  getDoctors: async (): Promise<any[]> => {
    const response = await api.get('/dashboard/doctors');
    return response.data;
  },

  getPatients: async (): Promise<any[]> => {
    const response = await api.get('/dashboard/patients');
    return response.data;
  },
};

export default api;
