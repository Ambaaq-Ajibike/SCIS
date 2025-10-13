'use client';

import { useState } from 'react';
import { hospitalSettingsService, EndpointValidationDto } from '@/lib/api';
import Layout from '../../components/Layout';

const SAMPLE_ENDPOINTS = [
  {
    name: 'HAPI FHIR Patient Search',
    url: 'https://hapi.fhir.org/baseR4/Patient',
    type: 'Patient'
  },
  {
    name: 'HAPI FHIR Observation Search',
    url: 'https://hapi.fhir.org/baseR4/Observation',
    type: 'Observation'
  },
  {
    name: 'HAPI FHIR Condition Search',
    url: 'https://hapi.fhir.org/baseR4/Condition',
    type: 'Condition'
  },
  {
    name: 'HAPI FHIR Medication Search',
    url: 'https://hapi.fhir.org/baseR4/Medication',
    type: 'Medication'
  },
  {
    name: 'HAPI FHIR DiagnosticReport Search',
    url: 'https://hapi.fhir.org/baseR4/DiagnosticReport',
    type: 'DiagnosticReport'
  }
];

export default function ApiTestPage() {
  const [results, setResults] = useState<EndpointValidationDto[]>([]);
  const [testing, setTesting] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [customType, setCustomType] = useState('Patient');

  const testEndpoint = async (url: string, type: string) => {
    try {
      const result = await hospitalSettingsService.validateEndpoint(url, type);
      setResults(prev => {
        const filtered = prev.filter(r => r.endpointUrl !== url);
        return [...filtered, result];
      });
      return result;
    } catch (error) {
      console.error('Test error:', error);
      const errorResult: EndpointValidationDto = {
        endpointUrl: url,
        endpointType: type,
        isValid: false,
        errorMessage: 'Failed to test endpoint',
        responseTimeMs: 0,
        validatedAt: new Date().toISOString()
      };
      setResults(prev => {
        const filtered = prev.filter(r => r.endpointUrl !== url);
        return [...filtered, errorResult];
      });
      return errorResult;
    }
  };

  const testAllEndpoints = async () => {
    setTesting(true);
    setResults([]);
    
    for (const endpoint of SAMPLE_ENDPOINTS) {
      await testEndpoint(endpoint.url, endpoint.type);
      // Small delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setTesting(false);
  };

  const testCustomEndpoint = async () => {
    if (!customUrl.trim()) return;
    await testEndpoint(customUrl, customType);
  };

  const getResult = (url: string) => {
    return results.find(r => r.endpointUrl === url);
  };

  return (
    <Layout>
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">FHIR Endpoint Testing</h1>
              <p className="mt-1 text-sm text-gray-600">
                Test FHIR endpoints to validate their structure and response format
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Test All Button */}
              <div className="flex justify-center">
                <button
                  onClick={testAllEndpoints}
                  disabled={testing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {testing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Testing All Endpoints...
                    </div>
                  ) : (
                    'Test All Sample Endpoints'
                  )}
                </button>
              </div>

              {/* Custom Endpoint Testing */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Test Custom Endpoint</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="customUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Endpoint URL
                    </label>
                    <input
                      type="url"
                      id="customUrl"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://hapi.fhir.org/baseR4/Patient"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="customType" className="block text-sm font-medium text-gray-700 mb-1">
                      Resource Type
                    </label>
                    <select
                      id="customType"
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Patient">Patient</option>
                      <option value="Observation">Observation</option>
                      <option value="Condition">Condition</option>
                      <option value="Medication">Medication</option>
                      <option value="DiagnosticReport">DiagnosticReport</option>
                      <option value="Procedure">Procedure</option>
                      <option value="Encounter">Encounter</option>
                      <option value="AllergyIntolerance">AllergyIntolerance</option>
                      <option value="Immunization">Immunization</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={testCustomEndpoint}
                      disabled={!customUrl.trim()}
                      className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                    >
                      Test Endpoint
                    </button>
                  </div>
                </div>
              </div>

              {/* Sample Endpoints */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sample FHIR Endpoints</h3>
                <div className="space-y-4">
                  {SAMPLE_ENDPOINTS.map((endpoint) => {
                    const result = getResult(endpoint.url);
                    return (
                      <div key={endpoint.url} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{endpoint.name}</h4>
                            <p className="text-sm text-gray-600">{endpoint.url}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {result && (
                              <>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  result.isValid 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {result.isValid ? '✓ Valid' : '✗ Invalid'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {result.responseTimeMs}ms
                                </span>
                              </>
                            )}
                            <button
                              onClick={() => testEndpoint(endpoint.url, endpoint.type)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              Test
                            </button>
                          </div>
                        </div>

                        {result && (
                          <div className="mt-3 space-y-2">
                            {!result.isValid && result.errorMessage && (
                              <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                                <strong>Error:</strong> {result.errorMessage}
                              </div>
                            )}

                            {result.responseSample && (
                              <details className="group">
                                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 group-open:text-blue-800">
                                  View Response Sample
                                </summary>
                                <div className="mt-2 p-3 bg-gray-100 rounded-md border">
                                  <pre className="text-xs text-gray-800 overflow-auto max-h-40 whitespace-pre-wrap">
                                    {result.responseSample}
                                  </pre>
                                </div>
                              </details>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Results Summary */}
              {results.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Test Results Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Total Tested:</span>
                      <span className="ml-2 text-gray-600">{results.length}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Valid:</span>
                      <span className="ml-2 text-green-600">{results.filter(r => r.isValid).length}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Invalid:</span>
                      <span className="ml-2 text-red-600">{results.filter(r => !r.isValid).length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}