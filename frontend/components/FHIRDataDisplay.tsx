'use client';

import { useState } from 'react';
import { 
  User, 
  FileText, 
  Activity, 
  Pill, 
  AlertTriangle,
  Calendar,
  Stethoscope
} from 'lucide-react';

interface FHIRBundle {
  resourceType: "Bundle";
  type: "searchset";
  total: number;
  entry: Array<{
    fullUrl: string;
    resource: any;
  }>;
}

interface FHIRDataDisplayProps {
  dataType: string;
  fhirData: string;
}

export default function FHIRDataDisplay({ dataType, fhirData }: FHIRDataDisplayProps) {
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set());

  const toggleResource = (resourceId: string) => {
    const newExpanded = new Set(expandedResources);
    if (newExpanded.has(resourceId)) {
      newExpanded.delete(resourceId);
    } else {
      newExpanded.add(resourceId);
    }
    setExpandedResources(newExpanded);
  };

  const parseFHIRData = (): FHIRBundle | null => {
    try {
      return JSON.parse(fhirData);
    } catch (error) {
      console.error('Failed to parse FHIR data:', error);
      return null;
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const renderPatientData = (resource: any) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <User className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-medium text-blue-900">Patient Information</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Name</p>
          <p className="text-gray-900">
            {resource.name?.[0]?.given?.join(' ')} {resource.name?.[0]?.family}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Gender</p>
          <p className="text-gray-900 capitalize">{resource.gender}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Date of Birth</p>
          <p className="text-gray-900">{formatDate(resource.birthDate)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Contact</p>
          <p className="text-gray-900">
            {resource.telecom?.[0]?.value || 'Not provided'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderConditionData = (resource: any) => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Stethoscope className="h-5 w-5 text-yellow-600 mr-2" />
          <h3 className="text-lg font-medium text-yellow-900">Medical Condition</h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          resource.clinicalStatus?.coding?.[0]?.code === 'active' 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {resource.clinicalStatus?.coding?.[0]?.code || 'Unknown'}
        </span>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-gray-700">Condition</p>
          <p className="text-gray-900">{resource.code?.text || 'Not specified'}</p>
        </div>
        {resource.onsetDateTime && (
          <div>
            <p className="text-sm font-medium text-gray-700">Onset Date</p>
            <p className="text-gray-900">{formatDate(resource.onsetDateTime)}</p>
          </div>
        )}
        {resource.severity?.coding?.[0]?.display && (
          <div>
            <p className="text-sm font-medium text-gray-700">Severity</p>
            <p className="text-gray-900">{resource.severity.coding[0].display}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMedicationData = (resource: any) => (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Pill className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-medium text-green-900">Medication</h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          resource.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {resource.status}
        </span>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-gray-700">Medication</p>
          <p className="text-gray-900">
            {resource.medicationReference?.display || resource.medicationCodeableConcept?.text || 'Not specified'}
          </p>
        </div>
        {resource.dosageInstruction?.[0]?.text && (
          <div>
            <p className="text-sm font-medium text-gray-700">Instructions</p>
            <p className="text-gray-900">{resource.dosageInstruction[0].text}</p>
          </div>
        )}
        {resource.authoredOn && (
          <div>
            <p className="text-sm font-medium text-gray-700">Prescribed</p>
            <p className="text-gray-900">{formatDate(resource.authoredOn)}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDiagnosticReportData = (resource: any) => (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-medium text-purple-900">Diagnostic Report</h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          resource.status === 'final' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {resource.status}
        </span>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-gray-700">Report Type</p>
          <p className="text-gray-900">{resource.code?.text || 'Not specified'}</p>
        </div>
        {resource.effectiveDateTime && (
          <div>
            <p className="text-sm font-medium text-gray-700">Effective Date</p>
            <p className="text-gray-900">{formatDate(resource.effectiveDateTime)}</p>
          </div>
        )}
        {resource.issued && (
          <div>
            <p className="text-sm font-medium text-gray-700">Issued</p>
            <p className="text-gray-900">{formatDate(resource.issued)}</p>
          </div>
        )}
        {resource.performer?.[0]?.display && (
          <div>
            <p className="text-sm font-medium text-gray-700">Performer</p>
            <p className="text-gray-900">{resource.performer[0].display}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderObservationData = (resource: any) => (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Activity className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-medium text-indigo-900">Observation</h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          resource.status === 'final' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {resource.status}
        </span>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-gray-700">Observation</p>
          <p className="text-gray-900">{resource.code?.text || 'Not specified'}</p>
        </div>
        {resource.valueQuantity && (
          <div>
            <p className="text-sm font-medium text-gray-700">Value</p>
            <p className="text-gray-900">
              {resource.valueQuantity.value} {resource.valueQuantity.unit}
            </p>
          </div>
        )}
        {resource.interpretation?.[0]?.text && (
          <div>
            <p className="text-sm font-medium text-gray-700">Interpretation</p>
            <p className="text-gray-900">{resource.interpretation[0].text}</p>
          </div>
        )}
        {resource.effectiveDateTime && (
          <div>
            <p className="text-sm font-medium text-gray-700">Date</p>
            <p className="text-gray-900">{formatDate(resource.effectiveDateTime)}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderGenericResource = (resource: any) => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <FileText className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">
          {resource.resourceType} Resource
        </h3>
      </div>
      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-gray-700">ID</p>
          <p className="text-gray-900">{resource.id}</p>
        </div>
        {resource.status && (
          <div>
            <p className="text-sm font-medium text-gray-700">Status</p>
            <p className="text-gray-900">{resource.status}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderResource = (resource: any, index: number) => {
    const resourceId = `${resource.resourceType}-${resource.id}-${index}`;
    const isExpanded = expandedResources.has(resourceId);

    let content;
    switch (resource.resourceType) {
      case 'Patient':
        content = renderPatientData(resource);
        break;
      case 'Condition':
        content = renderConditionData(resource);
        break;
      case 'MedicationRequest':
        content = renderMedicationData(resource);
        break;
      case 'DiagnosticReport':
        content = renderDiagnosticReportData(resource);
        break;
      case 'Observation':
        content = renderObservationData(resource);
        break;
      default:
        content = renderGenericResource(resource);
    }

    return (
      <div key={resourceId} className="mb-4">
        {content}
        <button
          onClick={() => toggleResource(resourceId)}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? 'Hide Raw Data' : 'Show Raw Data'}
        </button>
        {isExpanded && (
          <div className="mt-2 p-3 bg-gray-100 rounded border">
            <pre className="text-xs text-gray-800 overflow-auto max-h-64 whitespace-pre-wrap">
              {JSON.stringify(resource, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  const bundle = parseFHIRData();

  if (!bundle) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-red-800">Failed to parse FHIR data</p>
        </div>
      </div>
    );
  }

  if (bundle.total === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-500">
          No {dataType.toLowerCase()} data found for this patient.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {dataType} Data ({bundle.total} {bundle.total === 1 ? 'item' : 'items'})
        </h2>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          Retrieved: {new Date().toLocaleString()}
        </div>
      </div>
      
      {bundle.entry.map((entry, index) => 
        renderResource(entry.resource, index)
      )}
    </div>
  );
}
