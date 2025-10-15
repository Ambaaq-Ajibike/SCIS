'use client';

import { useState } from 'react';
import { 
  User, 
  Calendar, 
  FileText, 
  Activity, 
  Pill, 
  Heart,
  Eye,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import FhirBundleDisplay from './FhirBundleDisplay';

interface PatientDataDisplayProps {
  data: string;
  dataType: string;
}

interface ParsedData {
  resourceType?: string;
  id?: string;
  status?: string;
  subject?: {
    reference?: string;
  };
  effectiveDateTime?: string;
  issued?: string;
  performer?: Array<{
    reference?: string;
  }>;
  result?: Array<{
    reference?: {
      reference?: string;
    };
  }>;
  category?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  }>;
  clinicalStatus?: {
    coding?: Array<{
      system?: string;
      code?: string;
    }>;
  };
  recordedDate?: string;
  recorder?: {
    reference?: string;
  };
  performedDateTime?: string;
  [key: string]: any;
}

export default function PatientDataDisplay({ data, dataType }: PatientDataDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']));
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);

  // Parse the JSON data
  const parseData = () => {
    if (parsedData) return parsedData;
    
    try {
      const parsed = JSON.parse(data);
      setParsedData(parsed);
      return parsed;
    } catch (error) {
      console.error('Error parsing patient data:', error);
      return null;
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getDataTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'labresults':
        return <Activity className="h-5 w-5 text-blue-500" />;
      case 'medicalhistory':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'treatmentrecords':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'medicationhistory':
        return <Pill className="h-5 w-5 text-purple-500" />;
      case 'imagingreports':
        return <Eye className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'final':
      case 'completed':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'preliminary':
      case 'in-progress':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
      case 'entered-in-error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const renderSummary = (data: ParsedData) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <User className="h-4 w-4 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900">Patient Reference</span>
            </div>
            <p className="text-blue-800">{data.subject?.reference || 'Not specified'}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Calendar className="h-4 w-4 text-green-600 mr-2" />
              <span className="font-medium text-green-900">Date</span>
            </div>
            <p className="text-green-800">
              {formatDate(data.effectiveDateTime || data.recordedDate || data.performedDateTime)}
            </p>
          </div>
        </div>

        {data.status && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-4 w-4 text-gray-600 mr-2" />
              <span className="font-medium text-gray-900">Status</span>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}>
              {data.status}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderDetailedInfo = (data: ParsedData) => {
    return (
      <div className="space-y-6">
        {/* Resource Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Resource Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Resource Type:</span>
              <p className="text-gray-900">{data.resourceType || 'Not specified'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Resource ID:</span>
              <p className="text-gray-900 font-mono text-xs">{data.id || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Category Information */}
        {data.category && data.category.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Category</h4>
            <div className="space-y-2">
              {data.category.map((cat, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded">
                  {cat.coding?.map((coding, codingIndex) => (
                    <div key={codingIndex} className="text-sm">
                      <div className="font-medium text-gray-600">System:</div>
                      <p className="text-gray-900 font-mono text-xs">{coding.system}</p>
                      <div className="font-medium text-gray-600 mt-2">Code:</div>
                      <p className="text-gray-900">{coding.code}</p>
                      <div className="font-medium text-gray-600 mt-2">Display:</div>
                      <p className="text-gray-900">{coding.display}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performer Information */}
        {data.performer && data.performer.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Performer</h4>
            <div className="space-y-2">
              {data.performer.map((perf, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded">
                  <div className="text-sm">
                    <div className="font-medium text-gray-600">Reference:</div>
                    <p className="text-gray-900 font-mono text-xs">{perf.reference}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {data.result && data.result.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Results</h4>
            <div className="space-y-2">
              {data.result.map((result, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded">
                  <div className="text-sm">
                    <div className="font-medium text-gray-600">Reference:</div>
                    <p className="text-gray-900 font-mono text-xs">{result.reference?.reference}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRawData = () => {
    return (
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
        <pre className="text-sm whitespace-pre-wrap">{data}</pre>
      </div>
    );
  };

  const parsed = parseData();

  if (!parsed) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800 font-medium">Invalid Data Format</span>
        </div>
        <p className="text-red-700 mt-2">The received data is not in a valid JSON format.</p>
        <details className="mt-4">
          <summary className="cursor-pointer text-red-600 font-medium">View Raw Data</summary>
          <div className="mt-2 bg-gray-100 p-2 rounded text-sm font-mono">
            {data}
          </div>
        </details>
      </div>
    );
  }

  // Check if this is a FHIR Bundle and use the specialized component
  if (parsed.resourceType === 'Bundle') {
    return <FhirBundleDisplay data={data} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getDataTypeIcon(dataType)}
          <h3 className="ml-2 text-lg font-medium text-gray-900">
            {dataType.replace(/([A-Z])/g, ' $1').trim()}
          </h3>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(parsed.status)}`}>
          {parsed.status || 'Unknown'}
        </span>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['summary', 'details', 'raw'].map((section) => (
            <button
              key={section}
              onClick={() => toggleSection(section)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                expandedSections.has(section)
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                {expandedSections.has(section) ? (
                  <ChevronDown className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1" />
                )}
                {section}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {expandedSections.has('summary') && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">Summary</h4>
            {renderSummary(parsed)}
          </div>
        )}

        {expandedSections.has('details') && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">Detailed Information</h4>
            {renderDetailedInfo(parsed)}
          </div>
        )}

        {expandedSections.has('raw') && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">Raw JSON Data</h4>
            {renderRawData()}
          </div>
        )}
      </div>
    </div>
  );
}
