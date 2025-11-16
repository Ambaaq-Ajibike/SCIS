import apiClient from '@/services/apiClient';
import { API_ENDPOINTS } from '@/constants';

// Re-export apiClient as api for backward compatibility
const api = apiClient;

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

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'SystemManager' | 'HospitalManager' | 'Doctor' | 'Staff' | 'Patient';
  hospitalId?: string;
  hospitalName?: string;
  hospitalIsApproved?: boolean;
  hospitalIsActive?: boolean;
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

export interface DataAvailabilityResponse {
  isAvailable: boolean;
  message?: string;
  patientHospitalName?: string;
  patientName?: string;
  isCrossHospitalRequest: boolean;
  responseTimeMs: number;
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
  isApproved: boolean;
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
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  validateToken: async (): Promise<boolean> => {
    try {
      await api.post(API_ENDPOINTS.AUTH.VALIDATE);
      return true;
    } catch {
      return false;
    }
  },
};

export const patientAuthService = {
  login: async (credentials: PatientLoginRequest): Promise<PatientLoginResponse> => {
    const response = await api.post(API_ENDPOINTS.PATIENT_AUTH.LOGIN, credentials);
    return response.data;
  },

  completeSignup: async (signupData: CompletePatientSignupDto): Promise<PatientLoginResponse> => {
    const response = await api.post(API_ENDPOINTS.PATIENT_AUTH.COMPLETE_SIGNUP, signupData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post(API_ENDPOINTS.PATIENT_AUTH.LOGOUT);
  },

  validateToken: async (): Promise<boolean> => {
    try {
      await api.post(API_ENDPOINTS.PATIENT_AUTH.VALIDATE);
      return true;
    } catch {
      return false;
    }
  },
};

export const feedbackService = {
  submitFeedback: async (feedback: PatientFeedbackDto): Promise<PatientFeedbackResponse> => {
    const response = await api.post(API_ENDPOINTS.FEEDBACK.SUBMIT, feedback);
    return response.data;
  },

  getDoctorAverageTES: async (doctorId: string): Promise<{ doctorId: string; averageTES: number }> => {
    const response = await api.get(API_ENDPOINTS.FEEDBACK.DOCTOR_AVERAGE_TES(doctorId));
    return response.data;
  },

  getHospitalAverageTES: async (hospitalId: string): Promise<{ hospitalId: string; averageTES: number }> => {
    const response = await api.get(API_ENDPOINTS.FEEDBACK.HOSPITAL_AVERAGE_TES(hospitalId));
    return response.data;
  },

  getPerformanceInsights: async (): Promise<any[]> => {
    const response = await api.get(API_ENDPOINTS.FEEDBACK.INSIGHTS);
    return response.data;
  },

  getPatientHospitalDoctors: async (): Promise<Doctor[]> => {
    const response = await api.get(API_ENDPOINTS.FEEDBACK.PATIENT_DOCTORS);
    return response.data;
  },
};

export const dataRequestService = {
  requestData: async (request: DataRequestDto): Promise<DataRequestResponse> => {
    const response = await api.post(API_ENDPOINTS.DATA_REQUEST.REQUEST, request);
    return response.data;
  },

  approveRequest: async (approval: DataRequestApproval): Promise<DataRequestResponse> => {
    const response = await api.post(API_ENDPOINTS.DATA_REQUEST.APPROVE, approval);
    return response.data;
  },

  getPendingRequests: async (): Promise<PendingDataRequest[]> => {
    const response = await api.get(API_ENDPOINTS.DATA_REQUEST.PENDING);
    return response.data;
  },

  getRequestHistory: async (): Promise<DataRequestResponse[]> => {
    const response = await api.get(API_ENDPOINTS.DATA_REQUEST.HISTORY);
    return response.data;
  },

  checkAvailability: async (request: DataRequestDto): Promise<DataAvailabilityResponse> => {
    const response = await api.post(API_ENDPOINTS.DATA_REQUEST.CHECK_AVAILABILITY, request);
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
    const response = await api.get(API_ENDPOINTS.PATIENT.BASE, { params });
    return response.data;
  },

  getPatientById: async (patientId: string): Promise<Patient> => {
    const response = await api.get(API_ENDPOINTS.PATIENT.BY_ID(patientId));
    return response.data;
  },

  createPatient: async (patientData: CreatePatientDto): Promise<Patient> => {
    const response = await api.post(API_ENDPOINTS.PATIENT.BASE, patientData);
    return response.data;
  },

  updatePatient: async (patientId: string, patientData: UpdatePatientDto): Promise<Patient> => {
    const response = await api.put(API_ENDPOINTS.PATIENT.BY_ID(patientId), patientData);
    return response.data;
  },

  deletePatient: async (patientId: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.PATIENT.BY_ID(patientId));
  },
};

export const hospitalService = {
  getHospitals: async (): Promise<HospitalDto[]> => {
    const response = await api.get(API_ENDPOINTS.HOSPITAL.BASE);
    return response.data;
  },

  getDoctorsByHospital: async (hospitalId: string): Promise<Doctor[]> => {
    const response = await api.get(API_ENDPOINTS.HOSPITAL.DOCTORS(hospitalId));
    return response.data;
  },
};

export const hospitalSettingsService = {
  getHospitalSettings: async (hospitalId: string): Promise<HospitalSettingsDto> => {
    const response = await api.get(API_ENDPOINTS.HOSPITAL_SETTINGS.BY_ID(hospitalId));
    return response.data;
  },

  createHospitalSettings: async (settingsData: CreateHospitalSettingsDto): Promise<HospitalSettingsDto> => {
    const response = await api.post(API_ENDPOINTS.HOSPITAL_SETTINGS.BASE, settingsData);
    return response.data;
  },

  updateHospitalSettings: async (hospitalId: string, settingsData: UpdateHospitalSettingsDto): Promise<HospitalSettingsDto> => {
    const response = await api.put(API_ENDPOINTS.HOSPITAL_SETTINGS.BY_ID(hospitalId), settingsData);
    return response.data;
  },

  deleteHospitalSettings: async (hospitalId: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.HOSPITAL_SETTINGS.BY_ID(hospitalId));
  },

  validateEndpoint: async (endpointUrl: string, endpointType: string): Promise<EndpointValidationDto> => {
    const response = await api.post(API_ENDPOINTS.HOSPITAL_SETTINGS.VALIDATE_ENDPOINT, {
      endpointUrl,
      endpointType
    });
    return response.data;
  },

  validateAllEndpoints: async (hospitalId: string): Promise<HospitalSettingsDto> => {
    const response = await api.post(API_ENDPOINTS.HOSPITAL_SETTINGS.VALIDATE_ALL(hospitalId));
    return response.data;
  },

  validateSpecificEndpoints: async (hospitalId: string, endpointTypes: string[]): Promise<EndpointValidationDto[]> => {
    const response = await api.post(API_ENDPOINTS.HOSPITAL_SETTINGS.VALIDATE_SPECIFIC(hospitalId), {
      endpointTypes
    });
    return response.data;
  },

  buildUrl: async (baseUrl: string, parametersJson: string, values: Record<string, any>): Promise<any> => {
    const response = await api.post(API_ENDPOINTS.HOSPITAL_SETTINGS.BUILD_URL, {
      baseUrl,
      parametersJson,
      values
    });
    return response.data;
  }
};

export const dashboardService = {
  getDashboardStats: async (): Promise<any> => {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.STATS);
    return response.data;
  },

  getHospitalPerformance: async (): Promise<any[]> => {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.HOSPITAL_PERFORMANCE);
    return response.data;
  },

  getSentimentAnalysis: async (): Promise<any[]> => {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.SENTIMENT_ANALYSIS);
    return response.data;
  },

  getDoctors: async (): Promise<any[]> => {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.DOCTORS);
    return response.data;
  },

  getPatients: async (): Promise<any[]> => {
    const response = await api.get(API_ENDPOINTS.DASHBOARD.PATIENTS);
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
    const response = await api.get(API_ENDPOINTS.SYSTEM_MANAGER.DASHBOARD);
    return response.data;
  },

  getSystemAnalytics: async (): Promise<SystemAnalytics> => {
    const response = await api.get(API_ENDPOINTS.SYSTEM_MANAGER.ANALYTICS);
    return response.data;
  },

  getAllHospitals: async (): Promise<HospitalAnalytics[]> => {
    const response = await api.get(API_ENDPOINTS.SYSTEM_MANAGER.HOSPITALS);
    return response.data;
  },

  getHospitalDetail: async (hospitalId: string): Promise<HospitalDetail> => {
    const response = await api.get(API_ENDPOINTS.SYSTEM_MANAGER.HOSPITAL_DETAIL(hospitalId));
    return response.data;
  },

  getAllDoctors: async (): Promise<DoctorPerformance[]> => {
    const response = await api.get(API_ENDPOINTS.SYSTEM_MANAGER.DOCTORS);
    return response.data;
  },

  getDoctorsByHospital: async (hospitalId: string): Promise<DoctorPerformance[]> => {
    const response = await api.get(API_ENDPOINTS.SYSTEM_MANAGER.DOCTORS_BY_HOSPITAL(hospitalId));
    return response.data;
  },

  getAllDataRequests: async (): Promise<DataRequestResponse[]> => {
    const response = await api.get(API_ENDPOINTS.SYSTEM_MANAGER.DATA_REQUESTS);
    return response.data;
  },

  getDataRequestsByHospital: async (hospitalId: string): Promise<DataRequestResponse[]> => {
    const response = await api.get(API_ENDPOINTS.SYSTEM_MANAGER.DATA_REQUESTS_BY_HOSPITAL(hospitalId));
    return response.data;
  },

  getAllFeedbacks: async (): Promise<PatientFeedbackResponse[]> => {
    const response = await api.get(API_ENDPOINTS.SYSTEM_MANAGER.FEEDBACKS);
    return response.data;
  },

  getFeedbacksByHospital: async (hospitalId: string): Promise<PatientFeedbackResponse[]> => {
    const response = await api.get(API_ENDPOINTS.SYSTEM_MANAGER.FEEDBACKS_BY_HOSPITAL(hospitalId));
    return response.data;
  },
};

export interface RegisterHospitalRequest {
  hospitalName: string;
  address: string;
  phoneNumber?: string;
  licenseNumber?: string;
  managerUsername: string;
  managerEmail: string;
  managerPassword: string;
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
    const response = await api.post(API_ENDPOINTS.ONBOARDING.REGISTER_HOSPITAL, data);
    return response.data;
  },

  createDoctor: async (data: CreateDoctorRequest): Promise<Doctor> => {
    const response = await api.post(API_ENDPOINTS.ONBOARDING.CREATE_DOCTOR, data);
    return response.data;
  },

  approveHospital: async (data: ApproveHospitalRequest): Promise<void> => {
    await api.post(API_ENDPOINTS.ONBOARDING.APPROVE_HOSPITAL, data);
  },

  getPendingHospitals: async (): Promise<HospitalDto[]> => {
    const response = await api.get(API_ENDPOINTS.ONBOARDING.PENDING_HOSPITALS);
    return response.data;
  },

  getHospital: async (hospitalId: string): Promise<HospitalDto> => {
    const response = await api.get(API_ENDPOINTS.ONBOARDING.HOSPITAL(hospitalId));
    return response.data;
  },

  getMyHospital: async (): Promise<HospitalDto> => {
    const response = await api.get(API_ENDPOINTS.ONBOARDING.MY_HOSPITAL);
    return response.data;
  },
};

export default api;
