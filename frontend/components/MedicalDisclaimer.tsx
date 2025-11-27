'use client';

import { useState } from 'react';

export function MedicalDisclaimer() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            Important Medical Disclaimer
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>
              MediChat is an AI health assistant that provides general health information and guidance. 
              It <strong>cannot diagnose</strong> medical conditions, <strong>cannot prescribe</strong> medications, 
              and is <strong>not a substitute</strong> for professional medical advice, diagnosis, or treatment. 
              Always consult a qualified healthcare provider for medical concerns.
            </p>
            <p className="mt-2">
              <strong>In emergencies, call 911 immediately.</strong>
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-3 flex-shrink-0 text-amber-500 hover:text-amber-700"
          aria-label="Dismiss disclaimer"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function EmergencyBanner() {
  return (
    <div className="bg-red-100 border-l-4 border-red-600 p-2 text-xs">
      <div className="flex items-center gap-2">
        <svg className="h-4 w-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="font-semibold text-red-800">Emergency? Call 911</span>
        <span className="text-red-700">| Poison Control: 1-800-222-1222 | Suicide Hotline: 988</span>
      </div>
    </div>
  );
}
