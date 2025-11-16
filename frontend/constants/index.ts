/**
 * Application-wide constants
 */

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PATIENT_LOGIN: '/patient-login',
  SYSTEM_MANAGER_LOGIN: '/system-manager-login',
  DASHBOARD: '/dashboard',
  PATIENTS: '/patients',
  DOCTORS: '/doctors',
  HOSPITALS: '/hospitals',
  DATA_REQUESTS: '/data-requests',
  HOSPITAL_APPROVALS: '/hospital-approvals',
  HOSPITAL_SETTINGS: '/hospital-settings',
  FEEDBACK: '/feedback',
  LANDING: '/landing',
  REGISTER_HOSPITAL: '/register-hospital',
} as const;

export const USER_ROLES = {
  SYSTEM_MANAGER: 'SystemManager',
  HOSPITAL_MANAGER: 'HospitalManager',
  DOCTOR: 'Doctor',
  STAFF: 'Staff',
  PATIENT: 'Patient',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const DATA_TYPES = {
  LAB_RESULTS: 'LabResults',
  MEDICAL_HISTORY: 'MedicalHistory',
  TREATMENT_RECORDS: 'TreatmentRecords',
  PATIENT_DEMOGRAPHICS: 'PatientDemographics',
  VITAL_SIGNS: 'VitalSigns',
  MEDICATIONS: 'Medications',
  PROCEDURES: 'Procedures',
  DIAGNOSTIC_REPORTS: 'DiagnosticReports',
  ENCOUNTERS: 'Encounters',
  CONDITIONS: 'Conditions',
  ALLERGIES: 'Allergies',
  IMMUNIZATIONS: 'Immunizations',
} as const;

export const DATA_TYPE_LABELS: Record<string, string> = {
  [DATA_TYPES.LAB_RESULTS]: 'Lab Results',
  [DATA_TYPES.MEDICAL_HISTORY]: 'Medical History',
  [DATA_TYPES.TREATMENT_RECORDS]: 'Treatment Records',
  [DATA_TYPES.PATIENT_DEMOGRAPHICS]: 'Patient Demographics',
  [DATA_TYPES.VITAL_SIGNS]: 'Vital Signs',
  [DATA_TYPES.MEDICATIONS]: 'Medications',
  [DATA_TYPES.PROCEDURES]: 'Procedures',
  [DATA_TYPES.DIAGNOSTIC_REPORTS]: 'Diagnostic Reports',
  [DATA_TYPES.ENCOUNTERS]: 'Encounters',
  [DATA_TYPES.CONDITIONS]: 'Conditions',
  [DATA_TYPES.ALLERGIES]: 'Allergies',
  [DATA_TYPES.IMMUNIZATIONS]: 'Immunizations',
};

export const STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ALL: 'All',
} as const;

export const GENDER_OPTIONS = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
} as const;

export const TES_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 70,
  NEEDS_IMPROVEMENT: 0,
} as const;

export const CHART_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'] as const;

export const TOAST_CONFIG = {
  POSITION: 'top-right' as const,
  AUTO_CLOSE: 4000,
  HIDE_PROGRESS_BAR: false,
} as const;

export const DEBOUNCE_DELAY = 500;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VALIDATE: '/auth/validate',
  },
  PATIENT_AUTH: {
    LOGIN: '/patientauth/login',
    COMPLETE_SIGNUP: '/patientauth/complete-signup',
    LOGOUT: '/patientauth/logout',
    VALIDATE: '/patientauth/validate',
  },
  PATIENT: {
    BASE: '/patient',
    BY_ID: (id: string) => `/patient/${id}`,
  },
  HOSPITAL: {
    BASE: '/hospital',
    DOCTORS: (id: string) => `/hospital/${id}/doctors`,
  },
  HOSPITAL_SETTINGS: {
    BASE: '/hospitalsettings',
    BY_ID: (id: string) => `/hospitalsettings/${id}`,
    VALIDATE_ENDPOINT: '/hospitalsettings/validate-endpoint',
    VALIDATE_ALL: (id: string) => `/hospitalsettings/${id}/validate-all`,
    VALIDATE_SPECIFIC: (id: string) => `/hospitalsettings/${id}/validate-specific`,
    BUILD_URL: '/hospitalsettings/build-url',
  },
  DATA_REQUEST: {
    REQUEST: '/datarequest/request',
    APPROVE: '/datarequest/approve',
    PENDING: '/datarequest/pending',
    HISTORY: '/datarequest/history',
  },
  FEEDBACK: {
    SUBMIT: '/feedback/submit',
    DOCTOR_AVERAGE_TES: (id: string) => `/feedback/doctor/${id}/average-tes`,
    HOSPITAL_AVERAGE_TES: (id: string) => `/feedback/hospital/${id}/average-tes`,
    INSIGHTS: '/feedback/insights',
    PATIENT_DOCTORS: '/feedback/patient/doctors',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    HOSPITAL_PERFORMANCE: '/dashboard/hospital-performance',
    SENTIMENT_ANALYSIS: '/dashboard/sentiment-analysis',
    DOCTORS: '/dashboard/doctors',
    PATIENTS: '/dashboard/patients',
  },
  SYSTEM_MANAGER: {
    DASHBOARD: '/systemmanager/dashboard',
    ANALYTICS: '/systemmanager/analytics',
    HOSPITALS: '/systemmanager/hospitals',
    HOSPITAL_DETAIL: (id: string) => `/systemmanager/hospitals/${id}`,
    DOCTORS: '/systemmanager/doctors',
    DOCTORS_BY_HOSPITAL: (id: string) => `/systemmanager/hospitals/${id}/doctors`,
    DATA_REQUESTS: '/systemmanager/data-requests',
    DATA_REQUESTS_BY_HOSPITAL: (id: string) => `/systemmanager/hospitals/${id}/data-requests`,
    FEEDBACKS: '/systemmanager/feedbacks',
    FEEDBACKS_BY_HOSPITAL: (id: string) => `/systemmanager/hospitals/${id}/feedbacks`,
  },
  ONBOARDING: {
    REGISTER_HOSPITAL: '/onboarding/register-hospital',
    CREATE_DOCTOR: '/onboarding/create-doctor',
    APPROVE_HOSPITAL: '/onboarding/approve-hospital',
    PENDING_HOSPITALS: '/onboarding/pending-hospitals',
    HOSPITAL: (id: string) => `/onboarding/hospital/${id}`,
  },
} as const;

