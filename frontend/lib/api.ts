import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5066/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.baseURL + config.url);
    
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
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging and auth error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data, error.config?.url);
    
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
  approvalDate?: string;
  responseTimeMs: number;
  isConsentValid: boolean;
  isRoleAuthorized: boolean;
  isCrossHospitalRequest: boolean;
  requestingHospitalName?: string;
  patientHospitalName?: string;
  patientName?: string;
  patientId?: string;
  approvingUserName?: string;
}

export interface PendingDataRequest {
  id: string;
  patientName: string;
  patientId: string;
  requestingHospitalName: string;
  dataType: string;
  purpose?: string;
  requestDate: string;
  requestingUserName: string;
}

export interface DataRequestApproval {
  requestId: string;
  isApproved: boolean;
  reason?: string;
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
  email: string;
  hospitalId: string;
  hospital: Hospital;
  hospitalName: string;
  isActive: boolean;
  isSignupCompleted: boolean;
  createdAt: string;
}

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber?: string;
  email: string;
}

export interface UpdatePatientDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber?: string;
  email: string;
  isActive: boolean;
}

export interface CompletePatientSignupDto {
  patientId: string;
  password: string;
  confirmPassword: string;
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

export interface HospitalSettingsDto {
  id: string;
  hospitalId: string;
  hospitalName: string;
  patientEverythingEndpoint?: string;
  apiKey?: string;
  authToken?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isPatientEverythingEndpointValid: boolean;
  lastValidationDate?: string;
  lastValidationError?: string;
  
  // Parameter configuration for the endpoint
  patientEverythingEndpointParameters?: string;
}

export interface CreateHospitalSettingsDto {
  hospitalId: string;
  patientEverythingEndpoint?: string;
  apiKey?: string;
  authToken?: string;
  
  // Parameter configuration for the endpoint
  patientEverythingEndpointParameters?: string;
}

export interface UpdateHospitalSettingsDto {
  patientEverythingEndpoint?: string;
  apiKey?: string;
  authToken?: string;
  
  // Parameter configuration for the endpoint
  patientEverythingEndpointParameters?: string;
}

export interface EndpointValidationDto {
  endpointUrl: string;
  endpointType: string;
  isValid: boolean;
  errorMessage?: string;
  responseSample?: string;
  responseTimeMs: number;
  validatedAt: string;
}

export interface EndpointParameterDto {
  name: string;
  type: string; // Only "string" for path parameters
  required: boolean; // Always true for path parameters
  description?: string;
  example?: string;
  templatePlaceholder: string; // For path parameters: "{patientId}", "{id}", etc.
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

  completeSignup: async (signupData: CompletePatientSignupDto): Promise<PatientLoginResponse> => {
    const response = await api.post('/patientauth/complete-signup', signupData);
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

  approveRequest: async (approval: DataRequestApproval): Promise<DataRequestResponse> => {
    const response = await api.post('/datarequest/approve', approval);
    return response.data;
  },

  getPendingRequests: async (): Promise<PendingDataRequest[]> => {
    const response = await api.get('/datarequest/pending');
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
  getPatients: async (search?: string): Promise<Patient[]> => {
    const params = search ? { search } : {};
    const response = await api.get('/patient', { params });
    return response.data;
  },

  getPatientById: async (patientId: string): Promise<Patient> => {
    const response = await api.get(`/patient/${patientId}`);
    return response.data;
  },

  createPatient: async (patientData: CreatePatientDto): Promise<Patient> => {
    const response = await api.post('/patient', patientData);
    return response.data;
  },

  updatePatient: async (patientId: string, patientData: UpdatePatientDto): Promise<Patient> => {
    const response = await api.put(`/patient/${patientId}`, patientData);
    return response.data;
  },

  deletePatient: async (patientId: string): Promise<void> => {
    await api.delete(`/patient/${patientId}`);
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

export const hospitalSettingsService = {
  getHospitalSettings: async (hospitalId: string): Promise<HospitalSettingsDto> => {
    const response = await api.get(`/hospitalsettings/${hospitalId}`);
    return response.data;
  },

  createHospitalSettings: async (settingsData: CreateHospitalSettingsDto): Promise<HospitalSettingsDto> => {
    const response = await api.post('/hospitalsettings', settingsData);
    return response.data;
  },

  updateHospitalSettings: async (hospitalId: string, settingsData: UpdateHospitalSettingsDto): Promise<HospitalSettingsDto> => {
    const response = await api.put(`/hospitalsettings/${hospitalId}`, settingsData);
    return response.data;
  },

  deleteHospitalSettings: async (hospitalId: string): Promise<void> => {
    await api.delete(`/hospitalsettings/${hospitalId}`);
  },

          validateEndpoint: async (endpointUrl: string, endpointType: string): Promise<EndpointValidationDto> => {
            const response = await api.post('/hospitalsettings/validate-endpoint', {
              endpointUrl,
              endpointType
            });
            return response.data;
          },

  validateAllEndpoints: async (hospitalId: string): Promise<HospitalSettingsDto> => {
    const response = await api.post(`/hospitalsettings/${hospitalId}/validate-all`);
    return response.data;
  },

  validateSpecificEndpoints: async (hospitalId: string, endpointTypes: string[]): Promise<EndpointValidationDto[]> => {
    const response = await api.post(`/hospitalsettings/${hospitalId}/validate-specific`, {
      endpointTypes
    });
    return response.data;
  },

  buildUrl: async (baseUrl: string, parametersJson: string, values: Record<string, any>): Promise<any> => {
    const response = await api.post('/hospitalsettings/build-url', {
      baseUrl,
      parametersJson,
      values
    });
    return response.data;
  }
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

// System Manager Types
export interface SystemAnalytics {
  totalHospitals: number;
  totalPatients: number;
  totalDataRequests: number;
  totalDoctors: number;
  totalStaff: number;
  activeHospitals: number;
  activePatients: number;
  lastUpdated: string;
}

export interface HospitalAnalytics {
  hospitalId: string;
  hospitalName: string;
  address: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  totalPatients: number;
  totalDoctors: number;
  totalStaff: number;
  totalDataRequests: number;
  pendingDataRequests: number;
  approvedDataRequests: number;
  deniedDataRequests: number;
  averageResponseTimeMs: number;
  averageTreatmentEvaluationScore: number;
  totalFeedbacks: number;
}

export interface DoctorPerformance {
  doctorId: string;
  doctorName: string;
  email: string;
  specialty: string;
  hospitalId: string;
  hospitalName: string;
  isActive: boolean;
  totalPatients: number;
  totalDataRequests: number;
  totalFeedbacks: number;
  averageTreatmentEvaluationScore: number;
  averageSentimentScore: number;
  lastActivity: string;
}

export interface SystemManagerDashboard {
  systemAnalytics: SystemAnalytics;
  hospitalAnalytics: HospitalAnalytics[];
  topPerformingDoctors: DoctorPerformance[];
  recentDataRequests: DataRequestResponse[];
  recentFeedbacks: PatientFeedbackResponse[];
}

export interface HospitalDetail {
  hospitalInfo: HospitalAnalytics;
  doctors: DoctorPerformance[];
  patients: Patient[];
  dataRequests: DataRequestResponse[];
  feedbacks: PatientFeedbackResponse[];
}

export const systemManagerService = {
  getDashboard: async (): Promise<SystemManagerDashboard> => {
    const response = await api.get('/systemmanager/dashboard');
    return response.data;
  },

  getSystemAnalytics: async (): Promise<SystemAnalytics> => {
    const response = await api.get('/systemmanager/analytics');
    return response.data;
  },

  getAllHospitals: async (): Promise<HospitalAnalytics[]> => {
    const response = await api.get('/systemmanager/hospitals');
    return response.data;
  },

  getHospitalDetail: async (hospitalId: string): Promise<HospitalDetail> => {
    const response = await api.get(`/systemmanager/hospitals/${hospitalId}`);
    return response.data;
  },

  getAllDoctors: async (): Promise<DoctorPerformance[]> => {
    const response = await api.get('/systemmanager/doctors');
    return response.data;
  },

  getDoctorsByHospital: async (hospitalId: string): Promise<DoctorPerformance[]> => {
    const response = await api.get(`/systemmanager/hospitals/${hospitalId}/doctors`);
    return response.data;
  },

  getAllDataRequests: async (): Promise<DataRequestResponse[]> => {
    const response = await api.get('/systemmanager/data-requests');
    return response.data;
  },

  getDataRequestsByHospital: async (hospitalId: string): Promise<DataRequestResponse[]> => {
    const response = await api.get(`/systemmanager/hospitals/${hospitalId}/data-requests`);
    return response.data;
  },

  getAllFeedbacks: async (): Promise<PatientFeedbackResponse[]> => {
    const response = await api.get('/systemmanager/feedbacks');
    return response.data;
  },

  getFeedbacksByHospital: async (hospitalId: string): Promise<PatientFeedbackResponse[]> => {
    const response = await api.get(`/systemmanager/hospitals/${hospitalId}/feedbacks`);
    return response.data;
  },
};

export interface RegisterHospitalRequest {
  hospitalName: string;
  address: string;
  phoneNumber?: string;
  email: string;
  licenseNumber?: string;
  managerUsername: string;
  managerEmail: string;
  managerPassword: string;
  contactPersonName: string;
  contactPersonEmail: string;
  contactPersonPhone: string;
  verificationDocuments?: string;
  verificationNotes?: string;
}

export interface CreateDoctorRequest {
  username: string;
  email: string;
  password: string;
  specialty?: string;
}

export interface ApproveHospitalRequest {
  hospitalId: string;
  isApproved: boolean;
  approvalNotes?: string;
}

export const onboardingService = {
  registerHospital: async (data: RegisterHospitalRequest): Promise<LoginResponse> => {
    const response = await api.post('/onboarding/register-hospital', data);
    return response.data;
  },

  createDoctor: async (data: CreateDoctorRequest): Promise<Doctor> => {
    const response = await api.post('/onboarding/create-doctor', data);
    return response.data;
  },

  approveHospital: async (data: ApproveHospitalRequest): Promise<void> => {
    await api.post('/onboarding/approve-hospital', data);
  },

  getPendingHospitals: async (): Promise<HospitalDto[]> => {
    const response = await api.get('/onboarding/pending-hospitals');
    return response.data;
  },

  getHospital: async (hospitalId: string): Promise<HospitalDto> => {
    const response = await api.get(`/onboarding/hospital/${hospitalId}`);
    return response.data;
  },
};

export default api;
