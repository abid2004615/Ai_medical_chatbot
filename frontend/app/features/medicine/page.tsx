'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

export default function MedicineInfoPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const popularMedicines = ['Paracetamol', 'Ibuprofen', 'Cetirizine', 'Aspirin', 'Amoxicillin', 'Omeprazole'];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-background p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
            Medicine Information
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Search common OTC medicines and learn about uses, age restrictions & important warnings.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicine name..."
              className="w-full px-6 py-4 pl-12 rounded-xl border border-gray-200 dark:border-dark-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-base bg-white dark:bg-dark-surface text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Popular Medicines */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
            Popular Medicines
          </h2>
          <div className="flex flex-wrap gap-3">
            {popularMedicines.map((medicine) => (
              <button
                key={medicine}
                onClick={() => setSearchQuery(medicine)}
                className="px-6 py-3 rounded-full border border-gray-200 dark:border-dark-border text-black dark:text-white text-sm font-medium hover:bg-primary hover:text-white hover:border-primary transition-colors"
              >
                {medicine}
              </button>
            ))}
          </div>
        </div>

        {/* Information Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
            ℹ️ Important Notice
          </h3>
          <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
            This information is provided as general guidance. Always consult with a healthcare professional 
            before taking any medication. Do not use this as a substitute for professional medical advice.
          </p>
        </div>

        {/* Results Section - Placeholder */}
        {searchQuery && (
          <div className="mt-8 p-8 bg-gray-50 dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border">
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Search results for "{searchQuery}" will appear here.
              <br />
              <span className="text-sm mt-2 block">
                Connect this to your backend API to display medicine information.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
