'use client';

import React from 'react';
import { 
  User, 
  Calendar, 
  MapPin, 
  Activity, 
  Stethoscope, 
  Heart, 
  FileText, 
  Clock,
  Building2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface FhirBundleDisplayProps {
  data: string; // JSON string
}

interface FhirResource {
  resourceType: string;
  id: string;
  [key: string]: any;
}

interface FhirBundle {
  resourceType: 'Bundle';
  id: string;
  type: string;
  entry?: Array<{
    fullUrl: string;
    resource: FhirResource;
    search?: {
      mode: string;
    };
  }>;
}

const FhirBundleDisplay: React.FC<FhirBundleDisplayProps> = ({ data }) => {
  let bundle: FhirBundle;
  
  try {
    bundle = JSON.parse(data);
  } catch (e) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> Could not parse FHIR Bundle data.</span>
      </div>
    );
  }

  if (bundle.resourceType !== 'Bundle') {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Warning:</strong>
        <span className="block sm:inline"> This is not a FHIR Bundle resource.</span>
      </div>
    );
  }

  const renderResource = (resource: FhirResource) => {
    switch (resource.resourceType) {
      case 'Patient':
        return renderPatient(resource);
      case 'Encounter':
        return renderEncounter(resource);
      case 'Observation':
        return renderObservation(resource);
      case 'Device':
        return renderDevice(resource);
      case 'Condition':
        return renderCondition(resource);
      case 'ChargeItem':
        return renderChargeItem(resource);
      default:
        return renderGenericResource(resource);
    }
  };

  const renderPatient = (patient: any) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <User className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-blue-800">Patient Information</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {patient.name && patient.name[0] && (
          <div>
            <span className="font-medium text-gray-700">Name:</span>
            <p className="text-gray-900">
              {patient.name[0].given?.join(' ')} {patient.name[0].family}
            </p>
          </div>
        )}
        {patient.birthDate && (
          <div>
            <span className="font-medium text-gray-700">Birth Date:</span>
            <p className="text-gray-900">{new Date(patient.birthDate).toLocaleDateString()}</p>
          </div>
        )}
        {patient.gender && (
          <div>
            <span className="font-medium text-gray-700">Gender:</span>
            <p className="text-gray-900 capitalize">{patient.gender}</p>
          </div>
        )}
        {patient.identifier && patient.identifier[0] && (
          <div>
            <span className="font-medium text-gray-700">ID:</span>
            <p className="text-gray-900">{patient.identifier[0].value}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderEncounter = (encounter: any) => (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <Stethoscope className="h-5 w-5 text-green-600 mr-2" />
        <h3 className="text-lg font-semibold text-green-800">Medical Encounter</h3>
      </div>
      <div className="space-y-2">
        {encounter.status && (
          <div className="flex items-center">
            <Activity className="h-4 w-4 text-gray-500 mr-2" />
            <span className="font-medium text-gray-700">Status:</span>
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full capitalize">
              {encounter.status}
            </span>
          </div>
        )}
        {encounter.class && (
          <div>
            <span className="font-medium text-gray-700">Type:</span>
            <p className="text-gray-900">{encounter.class.display || encounter.class.code}</p>
          </div>
        )}
        {encounter.period && (
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-500 mr-2" />
            <span className="font-medium text-gray-700">Period:</span>
            <span className="ml-2 text-gray-900">
              {encounter.period.start && new Date(encounter.period.start).toLocaleString()}
              {encounter.period.end && ` - ${new Date(encounter.period.end).toLocaleString()}`}
            </span>
          </div>
        )}
        {encounter.location && encounter.location[0] && (
          <div className="flex items-center">
            <MapPin className="h-4 w-4 text-gray-500 mr-2" />
            <span className="font-medium text-gray-700">Location:</span>
            <span className="ml-2 text-gray-900">{encounter.location[0].location?.display}</span>
          </div>
        )}
        {encounter.reasonCode && encounter.reasonCode[0] && (
          <div>
            <span className="font-medium text-gray-700">Reason:</span>
            <p className="text-gray-900">{encounter.reasonCode[0].coding?.[0]?.display}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderObservation = (observation: any) => (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <Heart className="h-5 w-5 text-purple-600 mr-2" />
        <h3 className="text-lg font-semibold text-purple-800">Medical Observation</h3>
      </div>
      <div className="space-y-2">
        {observation.status && (
          <div className="flex items-center">
            <Activity className="h-4 w-4 text-gray-500 mr-2" />
            <span className="font-medium text-gray-700">Status:</span>
            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full capitalize">
              {observation.status}
            </span>
          </div>
        )}
        {observation.code && (
          <div>
            <span className="font-medium text-gray-700">Measurement:</span>
            <p className="text-gray-900">{observation.code.coding?.[0]?.display || observation.code.coding?.[0]?.code}</p>
          </div>
        )}
        {observation.valueQuantity && (
          <div className="flex items-center">
            <span className="font-medium text-gray-700">Value:</span>
            <span className="ml-2 text-lg font-semibold text-purple-800">
              {observation.valueQuantity.value} {observation.valueQuantity.unit}
            </span>
          </div>
        )}
        {observation.effectiveDateTime && (
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-500 mr-2" />
            <span className="font-medium text-gray-700">Date:</span>
            <span className="ml-2 text-gray-900">{new Date(observation.effectiveDateTime).toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderDevice = (device: any) => (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <Activity className="h-5 w-5 text-orange-600 mr-2" />
        <h3 className="text-lg font-semibold text-orange-800">Medical Device</h3>
      </div>
      <div className="space-y-2">
        {device.type && (
          <div>
            <span className="font-medium text-gray-700">Device Type:</span>
            <p className="text-gray-900">{device.type.coding?.[0]?.display}</p>
          </div>
        )}
        {device.identifier && device.identifier[0] && (
          <div>
            <span className="font-medium text-gray-700">Device ID:</span>
            <p className="text-gray-900 font-mono text-sm">{device.identifier[0].value}</p>
          </div>
        )}
        {device.patient && (
          <div>
            <span className="font-medium text-gray-700">Associated Patient:</span>
            <p className="text-gray-900">{device.patient.reference}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCondition = (condition: any) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <FileText className="h-5 w-5 text-red-600 mr-2" />
        <h3 className="text-lg font-semibold text-red-800">Medical Condition</h3>
      </div>
      <div className="space-y-2">
        {condition.code && (
          <div>
            <span className="font-medium text-gray-700">Condition:</span>
            <p className="text-gray-900">{condition.code.coding?.[0]?.display}</p>
          </div>
        )}
        {condition.clinicalStatus && (
          <div>
            <span className="font-medium text-gray-700">Clinical Status:</span>
            <p className="text-gray-900">{condition.clinicalStatus.coding?.[0]?.code}</p>
          </div>
        )}
        {condition.onsetAge && (
          <div>
            <span className="font-medium text-gray-700">Onset Age:</span>
            <p className="text-gray-900">{condition.onsetAge.value} years</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderChargeItem = (chargeItem: any) => (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <FileText className="h-5 w-5 text-yellow-600 mr-2" />
        <h3 className="text-lg font-semibold text-yellow-800">Charge Item</h3>
      </div>
      <div className="space-y-2">
        {chargeItem.status && (
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <p className="text-gray-900 capitalize">{chargeItem.status}</p>
          </div>
        )}
        {chargeItem.subject && (
          <div>
            <span className="font-medium text-gray-700">Subject:</span>
            <p className="text-gray-900">{chargeItem.subject.reference}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderGenericResource = (resource: any) => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <FileText className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">{resource.resourceType}</h3>
      </div>
      <div className="space-y-2">
        <div>
          <span className="font-medium text-gray-700">ID:</span>
          <p className="text-gray-900">{resource.id}</p>
        </div>
        {resource.status && (
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <p className="text-gray-900 capitalize">{resource.status}</p>
          </div>
        )}
      </div>
    </div>
  );

  const groupResourcesByType = () => {
    if (!bundle.entry) return {};
    
    return bundle.entry.reduce((groups: { [key: string]: FhirResource[] }, entry) => {
      const resourceType = entry.resource.resourceType;
      if (!groups[resourceType]) {
        groups[resourceType] = [];
      }
      groups[resourceType].push(entry.resource);
      return groups;
    }, {});
  };

  const groupedResources = groupResourcesByType();

  return (
    <div className="space-y-6">
      {/* Bundle Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Building2 className="h-6 w-6 text-primary-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">FHIR Bundle</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="font-medium text-gray-700">Bundle ID:</span>
            <p className="text-gray-900 font-mono text-sm">{bundle.id}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Type:</span>
            <p className="text-gray-900 capitalize">{bundle.type}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Total Resources:</span>
            <p className="text-gray-900">{bundle.entry?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Resource Groups */}
      {Object.entries(groupedResources).map(([resourceType, resources]) => (
        <div key={resourceType} className="space-y-4">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-gray-800 capitalize">
              {resourceType}s ({resources.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {resources.map((resource, index) => (
              <div key={`${resourceType}-${index}`}>
                {renderResource(resource)}
              </div>
            ))}
          </div>
        </div>
      ))}

      {bundle.entry && bundle.entry.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No resources found in this bundle.</p>
        </div>
      )}
    </div>
  );
};

export default FhirBundleDisplay;
