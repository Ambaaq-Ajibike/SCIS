# Module 1: Service-Level Connected Framework (Interoperability)
## Description of How It Works

### Overview

Module 1 provides a comprehensive interoperability framework that enables secure, standards-compliant data exchange between healthcare institutions. The system connects hospitals, manages patient consent, enforces role-based access control, and maintains complete audit trails—all while adhering to FHIR (Fast Healthcare Interoperability Resources) standards.

---

## 1. Hospital Onboarding System

### 1.1 Hospital Registration Process

**Step 1: Initial Registration**
- A hospital manager accesses the registration portal
- Submits hospital information:
  - Hospital name, address, phone number
  - License number
  - Verification documents (uploaded)
  - Manager credentials (username, email, password)
- System validates:
  - Email uniqueness
  - Hospital name uniqueness
  - Required fields completion

**Step 2: Hospital Record Creation**
- System creates a new `Hospital` entity with:
  - Unique identifier (GUID)
  - Registration timestamp
  - Status: `IsActive = false`, `IsApproved = false`
- Hospital manager account is created with role "HospitalManager"
- Password is hashed using BCrypt
- Manager is automatically logged in (pending approval)

**Step 3: Administrative Review**
- System Manager receives notification of new registration
- Reviews submitted documents and information
- Accesses pending hospitals dashboard
- Can approve or reject with notes

**Step 4: Approval Workflow**
- If approved:
  - Hospital status: `IsApproved = true`, `IsActive = true`
  - Hospital manager receives email notification
  - Hospital can now participate in data exchange
- If rejected:
  - Hospital status remains inactive
  - Rejection reason recorded
  - Manager notified with feedback

### 1.2 User Management (Role-Based Access Control)

**Hospital Manager Capabilities**:
- Create doctor accounts within their hospital
- Create staff accounts
- View all users in their hospital
- Manage hospital settings
- Approve cross-hospital data requests for their patients

**Doctor Account Creation**:
- Hospital Manager provides:
  - Username, email, password
  - Specialty (optional)
- System creates user with:
  - Role: "Doctor"
  - Hospital association
  - Permissions: Lab Results, Medical History, Treatment Records

**Staff Account Creation**:
- Similar process to doctor creation
- Role: "Staff"
- Limited permissions: Lab Results only

**Role Hierarchy**:
```
SystemManager (Full Access)
    ↓
HospitalManager (Hospital-wide access)
    ↓
Doctor (Lab Results, Medical History, Treatment Records)
    ↓
Staff (Lab Results only)
    ↓
Patient (Own data access)
```

---

## 2. Patient Consent Management

### 2.1 Patient Registration

**Initial Patient Record**:
- Patient record created by hospital staff
- Contains: Patient ID, name, DOB, gender, contact info
- Status: `IsSignupCompleted = false`

**Patient Signup Completion**:
- Patient accesses patient portal
- Provides patient ID and completes signup:
  - Sets password
  - Optionally provides biometric data (for future use)
- Status: `IsSignupCompleted = true`
- Patient can now manage consent

### 2.2 Consent Granting Process

**Consent Request Flow**:
1. Healthcare provider (Doctor/Staff) needs patient data
2. System checks for existing consent:
   - Patient ID
   - Requesting user ID
   - Data type (LabResults, MedicalHistory, etc.)
   - Active status and expiry date

**Consent Creation**:
- If no valid consent exists:
  - Patient is prompted (via mobile app or portal)
  - Patient reviews:
    - Who is requesting (hospital, user name)
    - What data type is requested
    - Purpose of request
  - Patient grants or denies consent
  - If granted, `PatientConsent` record created:
    - `IsConsented = true`
    - `ConsentDate = current timestamp`
    - `ExpiryDate = optional` (can be time-limited)
    - `DataType = requested type`
    - `Purpose = reason for request`

**Consent Validation**:
- Before any data request, system validates:
  - Consent exists and is active
  - Consent hasn't expired
  - Data type matches consent
  - Requesting user matches consent
- If validation fails, request is denied

### 2.3 Biometric Authentication (Future Enhancement)
- Patient consent can require biometric verification
- Fingerprint, face recognition, or other biometric data
- Stored securely and used for consent confirmation
- Adds extra layer of security for sensitive data

---

## 3. FHIR-Compliant Data Exchange

### 3.1 Data Request Initiation

**Request Submission**:
1. Authorized user (Doctor/Staff/Manager) logs into system
2. Navigates to data request form
3. Provides:
   - Patient ID (unique identifier)
   - Data type (LabResults, MedicalHistory, TreatmentRecords, etc.)
   - Purpose (optional description)
4. System validates:
   - User role has permission for requested data type
   - User is authenticated and active
   - Hospital is approved and active

### 3.2 Request Processing Workflow

**Step 1: Patient Identification**
- System searches for patient by Patient ID
- Retrieves patient record and associated hospital
- Determines if request is:
  - **Intra-hospital**: Patient belongs to same hospital as requester
  - **Cross-hospital**: Patient belongs to different hospital

**Step 2: Consent Validation**
- System checks `PatientConsent` table:
  - Patient ID matches
  - Requesting user ID matches
  - Data type matches
  - `IsConsented = true`
  - `IsActive = true`
  - `ExpiryDate` is null or in future
- If consent invalid, request is denied immediately

**Step 3: Role Authorization**
- System validates user role has permission:
  - HospitalManager: All data types
  - Doctor: LabResults, MedicalHistory, TreatmentRecords
  - Staff: LabResults only
- If unauthorized, request is denied

**Step 4: Request Routing**

**For Intra-Hospital Requests**:
- Patient belongs to same hospital
- System directly retrieves data from local database
- Formats data as FHIR-compliant JSON
- Returns immediately (no approval needed)

**For Cross-Hospital Requests**:
- Patient belongs to different hospital
- System creates `DataRequest` record:
  - Status: "Pending"
  - Requesting hospital and user
  - Patient hospital ID
  - Data type and purpose
- Request is queued for approval by patient's hospital

**Step 5: Approval Workflow (Cross-Hospital Only)**
- Patient's hospital manager receives notification
- Manager reviews request:
  - Patient identity
  - Requesting hospital
  - Data type and purpose
  - Consent status
- Manager can:
  - **Approve**: Request proceeds to data retrieval
  - **Deny**: Request rejected with reason

**Step 6: Data Retrieval**

**Endpoint Configuration**:
- Each hospital configures FHIR endpoints for each data type
- Stored in `DataRequestEndpoint` table:
  - Endpoint URL (e.g., `https://hapi.fhir.org/baseR4/DiagnosticReport?patient={patientId}`)
  - FHIR resource type (DiagnosticReport, Condition, Procedure, etc.)
  - Authentication (API key or token)
  - HTTP method (typically GET)

**FHIR Endpoint Call**:
- System constructs endpoint URL:
  - Replaces `{patientId}` placeholder with actual patient ID
  - Adds authentication headers if configured
  - Makes HTTP GET request to endpoint
- Receives FHIR-compliant JSON response
- Validates response format

**Step 7: Data Formatting**
- If data retrieved from database (intra-hospital):
  - System formats patient data as FHIR JSON:
    - LabResults → DiagnosticReport resource
    - MedicalHistory → Condition resources
    - TreatmentRecords → Procedure resources
- If data from external endpoint:
  - Response is already FHIR-compliant
  - System validates structure

**Step 8: Response Delivery**
- Data stored in `DataRequest` record:
  - `ResponseData = FHIR JSON`
  - `Status = "Completed"`
  - `ResponseDate = current timestamp`
  - `ResponseTimeMs = calculated duration`
- Requesting user receives:
  - FHIR-formatted data
  - Request details
  - Timestamp and response time

### 3.3 Supported FHIR Resources

**Data Type Mappings**:
- **LabResults** → `DiagnosticReport` (FHIR R4)
- **MedicalHistory** → `Condition` (FHIR R4)
- **TreatmentRecords** → `Procedure` (FHIR R4)
- **VitalSigns** → `Observation` with category "vital-signs"
- **Medications** → `MedicationRequest` (FHIR R4)
- **PatientDemographics** → `Patient` (FHIR R4)

**FHIR JSON Structure Example** (LabResults):
```json
{
  "resourceType": "DiagnosticReport",
  "id": "example-lab-result",
  "status": "final",
  "subject": {
    "reference": "Patient/12345"
  },
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "57698-3",
      "display": "CBC"
    }]
  },
  "effectiveDateTime": "2024-01-15T10:30:00Z",
  "result": [...]
}
```

---

## 4. Audit Logging System

### 4.1 Comprehensive Activity Tracking

**Logged Activities**:
- **Authentication**: User logins, logouts, token validations
- **Data Requests**: All request submissions, approvals, denials, completions
- **Consent Management**: Consent grants, revocations, expirations
- **Hospital Management**: Registrations, approvals, user creations
- **System Events**: Errors, failures, performance issues

### 4.2 Audit Log Structure

Each `AuditLog` entry contains:
- **Action**: Type of activity (e.g., "DataRequest", "Login", "ConsentGranted")
- **User**: User who performed the action
- **Hospital**: Hospital associated with the action
- **Entity Type**: Type of entity affected (User, Patient, DataRequest, etc.)
- **Entity ID**: Specific entity identifier
- **Details**: Human-readable description
- **Status**: Success, Failed, or Error
- **ErrorMessage**: Error details if failed
- **ResponseTimeMs**: Performance metric
- **Timestamp**: When action occurred
- **IPAddress**: Source IP address
- **UserAgent**: Browser/client information

### 4.3 Audit Log Usage

**Compliance**:
- HIPAA requires audit trails for all PHI access
- GDPR requires accountability and logging
- Regulatory audits can query audit logs

**Security**:
- Detect unauthorized access attempts
- Track data access patterns
- Investigate security incidents
- Monitor system performance

**Analytics**:
- Data request volumes
- Response time trends
- User activity patterns
- System usage statistics

---

## 5. System Architecture & Data Flow

### 5.1 Component Architecture

**Backend Services**:
- **OnboardingService**: Hospital registration and user management
- **DataRequestService**: Data request processing and FHIR integration
- **AuthService**: Authentication and authorization
- **PatientAuthService**: Patient-specific authentication
- **EmailService**: Notification delivery

**Database Entities**:
- `Hospital`: Healthcare institutions
- `User`: System users (managers, doctors, staff)
- `Patient`: Patient records
- `PatientConsent`: Consent records
- `DataRequest`: Data request transactions
- `DataRequestEndpoint`: FHIR endpoint configurations
- `AuditLog`: Activity logs

### 5.2 Authentication Flow

**User Login**:
1. User submits email and password
2. System validates credentials (BCrypt hash comparison)
3. Checks hospital approval status (if applicable)
4. Generates JWT token with claims:
   - User ID
   - Role
   - Hospital ID
5. Returns token to client
6. Logs authentication in audit log

**Token Validation**:
- Each API request includes JWT token in Authorization header
- System validates token signature and expiry
- Extracts user ID, role, and hospital ID from claims
- Authorizes request based on role and endpoint

### 5.3 Data Request Flow Diagram

```
[Doctor/Staff] 
    ↓
[Submit Data Request]
    ↓
[System: Validate User Role] → [Deny if unauthorized]
    ↓
[System: Find Patient] → [Deny if not found]
    ↓
[System: Check Consent] → [Deny if no consent]
    ↓
[Intra-Hospital?] 
    ├─ Yes → [Retrieve from Database] → [Format as FHIR] → [Return Data]
    └─ No → [Create Pending Request] → [Notify Patient Hospital]
            ↓
        [Hospital Manager Reviews]
            ↓
        [Approve?]
            ├─ Yes → [Call FHIR Endpoint] → [Retrieve Data] → [Return to Requester]
            └─ No → [Deny Request] → [Notify Requester]
```

### 5.4 Security Measures

**Data Protection**:
- All passwords hashed with BCrypt
- JWT tokens with expiration
- HTTPS encryption for all communications
- Hospital-scoped data isolation
- Role-based access enforcement

**Privacy Controls**:
- Patient consent required for all data access
- Granular data type permissions
- Purpose-based authorization
- Consent expiry and revocation
- Complete audit trails

---

## 6. Integration Points

### 6.1 FHIR Endpoint Configuration

**Hospital Endpoint Setup**:
- Hospital Manager configures endpoints for each data type
- Provides:
  - Endpoint URL with `{patientId}` placeholder
  - FHIR resource type
  - Authentication credentials (if required)
  - HTTP method
- System validates endpoint:
  - Tests connectivity
  - Verifies FHIR format
  - Records validation status

**Endpoint Validation**:
- System periodically tests endpoints
- Records validation status and errors
- Alerts hospital if endpoint becomes unavailable

### 6.2 API Integration

**RESTful API Design**:
- Standard HTTP methods (GET, POST)
- JSON request/response format
- RESTful URL structure
- Error handling with status codes

**Key Endpoints**:
- `POST /api/onboarding/register-hospital` - Hospital registration
- `POST /api/onboarding/approve-hospital` - Hospital approval
- `POST /api/datarequest/request` - Submit data request
- `POST /api/datarequest/approve` - Approve request
- `GET /api/datarequest/history` - Request history
- `GET /api/datarequest/pending` - Pending requests

---

## 7. Error Handling & Edge Cases

### 7.1 Request Denial Scenarios

**Automatic Denials**:
- Invalid user credentials
- User role lacks permission
- Patient not found
- No valid consent
- Consent expired
- Hospital not approved
- Endpoint unavailable

**Manual Denials**:
- Hospital manager rejects cross-hospital request
- Patient revokes consent
- Administrative override

### 7.2 Error Recovery

**Retry Logic**:
- Failed endpoint calls can be retried
- Exponential backoff for transient failures
- Maximum retry attempts

**Notification System**:
- Email notifications for:
  - Request approvals/denials
  - Endpoint failures
  - System errors
  - Hospital approval status

---

## 8. Performance & Scalability

### 8.1 Performance Optimizations

**Database Indexing**:
- Indexed fields: Patient ID, User Email, Request Status, Timestamps
- Optimized queries for common operations
- Efficient joins for related entities

**Caching Strategy**:
- User authentication tokens cached
- Hospital endpoint configurations cached
- Frequently accessed data cached

**Response Time Targets**:
- Intra-hospital requests: < 2 seconds
- Cross-hospital requests: < 24 hours (approval dependent)
- API response time: < 500ms average

### 8.2 Scalability Features

**Multi-Tenant Architecture**:
- Hospital data isolation
- Scalable database design
- Horizontal scaling capability

**Load Balancing**:
- API can be deployed across multiple servers
- Database connection pooling
- Stateless API design

---

## 9. Compliance & Regulatory Alignment

### 9.1 HIPAA Compliance

**Required Features**:
- Audit logging of all PHI access
- Access controls and authentication
- Data encryption in transit
- Consent management
- Breach notification capabilities

### 9.2 GDPR Compliance

**Required Features**:
- Patient consent management
- Right to access (audit logs)
- Right to erasure (data deletion)
- Data portability (FHIR export)
- Accountability (audit trails)

### 9.3 FHIR Standards Compliance

**HL7 FHIR R4**:
- Resource structure compliance
- RESTful API design
- JSON format
- Standard resource types
- Search parameter support

---

## 10. Future Enhancements

### 10.1 Planned Features

**Enhanced Consent**:
- Biometric authentication integration
- Mobile app for consent management
- Consent templates and presets

**Advanced Analytics**:
- Data request analytics dashboard
- Performance metrics visualization
- Usage statistics and reporting

**Integration Expansions**:
- Webhook support for real-time notifications
- GraphQL API option
- Bulk data requests
- Scheduled data synchronization

**Security Enhancements**:
- Two-factor authentication
- Advanced threat detection
- Blockchain for consent (exploratory)
- Zero-trust architecture

---

## Summary

Module 1 provides a complete, secure, and standards-compliant interoperability framework that:

1. **Streamlines Hospital Onboarding**: Automated registration and approval workflows
2. **Manages Patient Consent**: Granular, time-limited consent with audit trails
3. **Enables FHIR Data Exchange**: Standards-based API integration for seamless data sharing
4. **Enforces Security**: Role-based access control and comprehensive authentication
5. **Maintains Compliance**: Complete audit logging for regulatory requirements
6. **Scales Efficiently**: Multi-tenant architecture supporting unlimited hospitals

The system bridges the gap between isolated healthcare systems while maintaining the highest standards of security, privacy, and regulatory compliance, ultimately improving patient care through better data accessibility and coordination.

