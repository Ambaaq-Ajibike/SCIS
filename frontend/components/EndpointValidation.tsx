'use client';

import { useState } from 'react';
import { hospitalSettingsService, EndpointValidationDto } from '@/lib/api';

interface EndpointValidationProps {
  endpointUrl: string;
  endpointType: string;
  onValidationComplete: (result: EndpointValidationDto) => void;
  disabled?: boolean;
}

export default function EndpointValidation({ 
  endpointUrl, 
  endpointType, 
  onValidationComplete,
  disabled = false 
}: EndpointValidationProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<EndpointValidationDto | null>(null);

  const handleValidate = async () => {
    if (!endpointUrl.trim() || isValidating) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await hospitalSettingsService.validateEndpoint(endpointUrl, endpointType);
      setValidationResult(result);
      onValidationComplete(result);
    } catch (error) {
      console.error('Validation error:', error);
      const errorResult: EndpointValidationDto = {
        endpointUrl,
        endpointType,
        isValid: false,
        errorMessage: 'Failed to validate endpoint',
        responseTimeMs: 0,
        validatedAt: new Date().toISOString()
      };
      setValidationResult(errorResult);
      onValidationComplete(errorResult);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleValidate}
        disabled={!endpointUrl.trim() || isValidating || disabled}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isValidating ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Validating...
          </div>
        ) : (
          'Validate'
        )}
      </button>

      {validationResult && (
        <div className="space-y-2">
          <div className={`p-3 rounded-md ${
            validationResult.isValid 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${
                validationResult.isValid ? 'text-green-800' : 'text-red-800'
              }`}>
                {validationResult.isValid ? '✓ Valid' : '✗ Invalid'}
              </span>
              <span className="text-xs text-gray-500">
                {validationResult.responseTimeMs}ms
              </span>
            </div>
            
            {validationResult.errorMessage && (
              <p className="mt-1 text-sm text-red-700">
                {validationResult.errorMessage}
              </p>
            )}
          </div>

          {validationResult.responseSample && (
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
      )}
    </div>
  );
}
