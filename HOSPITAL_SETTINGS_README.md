# Hospital Settings & FHIR Endpoint Configuration

This document describes the Hospital Settings functionality that allows hospitals to configure and validate their FHIR/HL7 data endpoints for seamless data integration.

## 🏥 Overview

The Hospital Settings system provides a comprehensive solution for managing hospital-specific FHIR endpoints, enabling secure and validated data exchange between the SCIS platform and external healthcare systems.

## 🔧 Features

### Backend Implementation

#### 1. **HospitalSettings Entity**
- Stores endpoint configurations for each hospital
- Tracks validation status for each endpoint
- Supports authentication credentials (API Key, Auth Token)
- Maintains audit trail with timestamps

#### 2. **FHIR Validation Service**
- Validates endpoint URLs and FHIR JSON structure
- Tests connectivity and response format
- Measures response times
- Provides detailed error messages

#### 3. **Hospital Settings Service**
- CRUD operations for hospital settings
- Bulk endpoint validation
- Individual endpoint testing
- Multi-tenant support

#### 4. **REST API Endpoints**
```
GET    /api/hospitalsettings/{hospitalId}           - Get hospital settings
POST   /api/hospitalsettings                        - Create hospital settings
PUT    /api/hospitalsettings/{hospitalId}           - Update hospital settings
DELETE /api/hospitalsettings/{hospitalId}           - Delete hospital settings
POST   /api/hospitalsettings/validate-endpoint      - Validate single endpoint
POST   /api/hospitalsettings/{hospitalId}/validate-all - Validate all endpoints
POST   /api/hospitalsettings/{hospitalId}/validate-specific - Validate specific endpoints
```

### Frontend Implementation

#### 1. **Hospital Settings Page** (`/hospital-settings`)
- Hospital selection dropdown
- Endpoint configuration forms
- Real-time validation
- Settings summary and status

#### 2. **Endpoint Configuration Components**
- `EndpointConfig.tsx` - Individual endpoint configuration
- `EndpointValidation.tsx` - Validation testing component

#### 3. **API Test Page** (`/api-test`)
- Test sample FHIR endpoints
- Custom endpoint testing
- Results visualization

## 📋 Supported FHIR Endpoints

The system supports configuration for the following FHIR resource types:

1. **Data Request Endpoint** - General data requests
2. **Patient Endpoint** - Patient resource access
3. **Observation Endpoint** - Clinical observations
4. **Condition Endpoint** - Medical conditions
5. **Medication Endpoint** - Medication information
6. **Diagnostic Report Endpoint** - Diagnostic reports
7. **Procedure Endpoint** - Medical procedures
8. **Encounter Endpoint** - Healthcare encounters
9. **Allergy Intolerance Endpoint** - Allergy information
10. **Immunization Endpoint** - Immunization records

## 🔍 Validation Process

### 1. **URL Validation**
- Checks for valid URL format
- Ensures HTTPS protocol (recommended)
- Validates endpoint accessibility

### 2. **FHIR Structure Validation**
- Verifies JSON response format
- Checks for required FHIR fields (`resourceType`, `id`)
- Validates Bundle structure for search results
- Ensures proper resource type matching

### 3. **Response Analysis**
- Measures response time
- Captures response samples
- Identifies validation errors
- Provides detailed feedback

## 🚀 Usage Examples

### Sample HAPI FHIR Endpoints

The system includes pre-configured test endpoints using the HAPI FHIR R4 test server:

```
Patient Search: https://hapi.fhir.org/baseR4/Patient
Observation Search: https://hapi.fhir.org/baseR4/Observation
Condition Search: https://hapi.fhir.org/baseR4/Condition
Medication Search: https://hapi.fhir.org/baseR4/Medication
DiagnosticReport Search: https://hapi.fhir.org/baseR4/DiagnosticReport
```

### Configuration Workflow

1. **Select Hospital** - Choose the hospital to configure
2. **Set Authentication** - Configure API keys or auth tokens if required
3. **Configure Endpoints** - Enter FHIR endpoint URLs
4. **Validate Endpoints** - Test each endpoint individually or in bulk
5. **Save Settings** - Persist validated configurations

## 🔐 Security Features

### Multi-Tenant Support
- Hospital-scoped settings isolation
- Role-based access control
- Secure credential storage

### Authentication Support
- API Key authentication
- Bearer token authentication
- Configurable per endpoint

### Validation Security
- Timeout protection (30 seconds)
- Error message sanitization
- Response size limiting

## 📊 Monitoring & Analytics

### Validation Tracking
- Last validation timestamps
- Success/failure rates
- Response time metrics
- Error logging

### Settings Audit
- Creation and update timestamps
- User activity tracking
- Configuration change history

## 🛠️ Technical Implementation

### Database Schema

```sql
CREATE TABLE HospitalSettings (
    Id UUID PRIMARY KEY,
    HospitalId UUID NOT NULL,
    DataRequestEndpoint VARCHAR(500),
    PatientEndpoint VARCHAR(500),
    ObservationEndpoint VARCHAR(500),
    -- ... other endpoints
    ApiKey VARCHAR(100),
    AuthToken VARCHAR(100),
    IsDataRequestEndpointValid BOOLEAN DEFAULT FALSE,
    -- ... validation status fields
    CreatedAt TIMESTAMP WITH TIME ZONE,
    UpdatedAt TIMESTAMP WITH TIME ZONE,
    IsActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (HospitalId) REFERENCES Hospitals(Id)
);
```

### API Integration

The system integrates with the existing SCIS API structure:

```typescript
// Frontend API calls
const settings = await hospitalSettingsService.getHospitalSettings(hospitalId);
const validation = await hospitalSettingsService.validateEndpoint(url, type);
const updated = await hospitalSettingsService.updateHospitalSettings(hospitalId, data);
```

## 🧪 Testing

### Manual Testing
1. Navigate to `/hospital-settings`
2. Select a hospital
3. Configure endpoints
4. Test validation
5. Save settings

### API Testing
1. Navigate to `/api-test`
2. Test sample endpoints
3. Test custom endpoints
4. Review validation results

### Integration Testing
- Test with HAPI FHIR server
- Validate different resource types
- Test error scenarios
- Verify response parsing

## 🔄 Future Enhancements

### Planned Features
1. **Batch Operations** - Bulk endpoint management
2. **Health Monitoring** - Continuous endpoint monitoring
3. **Performance Metrics** - Detailed analytics dashboard
4. **Template Management** - Pre-configured endpoint templates
5. **Advanced Validation** - Custom validation rules

### Integration Opportunities
1. **Data Request Integration** - Use configured endpoints for data requests
2. **Real-time Sync** - Continuous data synchronization
3. **Alert System** - Endpoint health notifications
4. **Backup Endpoints** - Failover configuration

## 📚 References

- [HAPI FHIR R4 Test Server](https://hapi.fhir.org/baseR4/swagger-ui/)
- [FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [FHIR JSON Format](https://hl7.org/fhir/R4/json.html)

## 🎯 Success Criteria

✅ **Completed Features:**
- Hospital settings entity and database schema
- FHIR endpoint validation service
- REST API endpoints for CRUD operations
- Frontend configuration interface
- Real-time endpoint testing
- Integration with HAPI FHIR test server
- Multi-tenant security support
- Comprehensive error handling

✅ **Validation Results:**
- Successfully validates HAPI FHIR endpoints
- Properly parses FHIR JSON responses
- Measures response times accurately
- Provides detailed error messages
- Supports all major FHIR resource types

The Hospital Settings system is now fully functional and ready for production use, providing hospitals with a robust solution for managing their FHIR endpoint configurations.
