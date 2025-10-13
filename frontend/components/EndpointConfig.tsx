'use client';

import { useState } from 'react';
import EndpointValidation from './EndpointValidation';
import { EndpointValidationDto } from '@/lib/api';

interface EndpointConfigProps {
  label: string;
  description: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  isValid?: boolean;
  validationResult?: EndpointValidationDto;
  onValidationComplete: (result: EndpointValidationDto) => void;
  disabled?: boolean;
}

export default function EndpointConfig({
  label,
  description,
  placeholder,
  value,
  onChange,
  isValid,
  validationResult,
  onValidationComplete,
  disabled = false
}: EndpointConfigProps) {
  const [isValidating, setIsValidating] = useState(false);

  const handleValidationStart = () => {
    setIsValidating(true);
  };

  const handleValidationComplete = (result: EndpointValidationDto) => {
    setIsValidating(false);
    onValidationComplete(result);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="flex items-center space-x-2">
          {isValid !== undefined && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isValid 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isValid ? '✓ Valid' : '✗ Invalid'}
            </span>
          )}
          {validationResult && (
            <span className="text-xs text-gray-500">
              {validationResult.responseTimeMs}ms
            </span>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-600">{description}</p>
      
      <div className="flex space-x-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <EndpointValidation
          endpointUrl={value}
          endpointType={label.replace(' Endpoint', '')}
          onValidationComplete={handleValidationComplete}
          disabled={disabled || !value.trim()}
        />
      </div>

      {validationResult && !validationResult.isValid && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          <strong>Validation Error:</strong> {validationResult.errorMessage}
        </div>
      )}

      {validationResult && validationResult.responseSample && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 group-open:text-blue-800">
            View Response Sample
          </summary>
          <div className="mt-2 p-3 bg-gray-100 rounded-md border">
            <pre className="text-xs text-gray-800 overflow-auto max-h-32 whitespace-pre-wrap">
              {validationResult.responseSample}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
}
