'use client';

import { useState } from 'react';
import { EndpointParameterDto } from '@/lib/api';

interface EndpointParameterConfigProps {
  endpointType: string;
  endpointUrl: string;
  parameters: EndpointParameterDto[];
  onParametersChange: (parameters: EndpointParameterDto[]) => void;
}

export default function EndpointParameterConfig({
  endpointType,
  endpointUrl,
  parameters,
  onParametersChange
}: EndpointParameterConfigProps) {
  const [showConfig, setShowConfig] = useState(false);

  const addParameter = () => {
    const newParameter: EndpointParameterDto = {
      name: '',
      type: 'string',
      required: true,
      description: '',
      example: '',
      templatePlaceholder: ''
    };
    onParametersChange([...parameters, newParameter]);
  };

  const generateEndpointPreview = () => {
    let preview = endpointUrl;
    
    parameters.forEach(param => {
      if (param.templatePlaceholder && param.example) {
        // Replace template placeholder with example value
        preview = preview.replace(param.templatePlaceholder, param.example);
      }
    });
    
    return preview;
  };

  const getPathParameters = () => {
    return parameters; // All parameters are path parameters now
  };

  const updateParameter = (index: number, field: keyof EndpointParameterDto, value: string | boolean) => {
    const updatedParameters = [...parameters];
    updatedParameters[index] = {
      ...updatedParameters[index],
      [field]: value
    };
    onParametersChange(updatedParameters);
  };

  const removeParameter = (index: number) => {
    const updatedParameters = parameters.filter((_, i) => i !== index);
    onParametersChange(updatedParameters);
  };

  const getLocationColor = (location: string) => {
    switch (location) {
      case 'query': return 'bg-blue-100 text-blue-800';
      case 'path': return 'bg-green-100 text-green-800';
      case 'body': return 'bg-purple-100 text-purple-800';
      case 'header': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'string': return 'bg-blue-100 text-blue-800';
      case 'number': return 'bg-green-100 text-green-800';
      case 'boolean': return 'bg-yellow-100 text-yellow-800';
      case 'date': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mt-3">
      <button
        onClick={() => setShowConfig(!showConfig)}
        className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
      >
        {showConfig ? 'Hide Parameter Configuration' : 'Configure Parameters'}
        {parameters.length > 0 && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {parameters.length} parameter{parameters.length !== 1 ? 's' : ''}
          </span>
        )}
      </button>

      {showConfig && (
        <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-900">Parameters for {endpointType}</h4>
            <button
              onClick={addParameter}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Parameter
            </button>
          </div>

          {parameters.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No parameters configured</p>
          ) : (
            <div className="space-y-3">
              {parameters.map((param, index) => (
                <div key={index} className="p-3 bg-white rounded border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Parameter Name *
                      </label>
                      <input
                        type="text"
                        value={param.name}
                        onChange={(e) => updateParameter(index, 'name', e.target.value)}
                        placeholder="e.g., patientId"
                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Template Placeholder *
                      </label>
                      <input
                        type="text"
                        value={param.templatePlaceholder}
                        onChange={(e) => updateParameter(index, 'templatePlaceholder', e.target.value)}
                        placeholder="e.g., {patientId}, {id}"
                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        The placeholder in your endpoint URL (include curly braces)
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Example Value *
                      </label>
                      <input
                        type="text"
                        value={param.example || ''}
                        onChange={(e) => updateParameter(index, 'example', e.target.value)}
                        placeholder="e.g., 12345"
                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Example value for testing and preview
                      </p>
                    </div>

                    <div className="flex items-end space-x-2">
                      <span className="text-xs text-gray-500 italic">Path Parameter (Required)</span>
                      <button
                        onClick={() => removeParameter(index)}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="mt-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={param.description || ''}
                      onChange={(e) => updateParameter(index, 'description', e.target.value)}
                      placeholder="Describe what this parameter is used for"
                      className="block w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Parameter Preview */}
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Preview:</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getLocationColor(param.location)}`}>
                      {param.location}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(param.type)}`}>
                      {param.type}
                    </span>
                    {param.required && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        required
                      </span>
                    )}
                    <span className="text-xs text-gray-600">
                      {param.name || 'unnamed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Endpoint Preview */}
          {parameters.length > 0 && (
            <div className="mt-3 p-3 bg-green-50 rounded border">
              <h5 className="text-sm font-medium text-green-800 mb-2">Endpoint Preview</h5>
              <div className="text-sm text-green-700">
                <div className="font-mono bg-white p-2 rounded border text-xs break-all">
                  {generateEndpointPreview()}
                </div>
              </div>
              
              {/* Parameter Summary */}
              <div className="mt-2 text-xs">
                <div>
                  <strong className="text-green-800">Path Parameters:</strong>
                  <ul className="mt-1 space-y-1">
                    {getPathParameters().map((param, idx) => (
                      <li key={idx} className="text-green-700">
                        {param.templatePlaceholder} → {param.example || 'no example'}
                        <span className="text-red-600 ml-1">*</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
            <strong>Path Parameters Only:</strong>
            <p className="mt-1">
              This system only supports path parameters embedded in the URL. 
              For endpoints like <code>/Patient/{'{patientId}'}/$everything</code>, 
              set the template placeholder to <code>{'{patientId}'}</code> and provide an example value.
            </p>
            <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
              <strong>💡 Example:</strong> 
              <ul className="mt-1 space-y-1">
                <li>• URL: <code>https://hapi.fhir.org/baseR4/Patient/{'{patientId}'}/$everything</code></li>
                <li>• Template Placeholder: <code>{'{patientId}'}</code></li>
                <li>• Example Value: <code>12345</code></li>
                <li>• Result: <code>https://hapi.fhir.org/baseR4/Patient/12345/$everything</code></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
