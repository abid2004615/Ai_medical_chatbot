/**
 * MedicineSearch Component
 * Search and display OTC medicine information
 */

'use client';

import { useState } from 'react';

interface Medicine {
  name: string;
  generic: string;
  brand_examples: string[];
  uses: string[];
  age_restrictions: string;
  warnings: string[];
}

export function MedicineSearch() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchMedicine = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `http://localhost:5000/api/medicine/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data.found) {
        setResult(data);
      } else {
        setError('Medicine not found. Try another name.');
        setResult(null);
      }
    } catch (err) {
      setError('Failed to search medicine');
    } finally {
      setLoading(false);
    }
  };

  const commonMedicines = [
    'Cetirizine', 'Paracetamol', 'Ibuprofen', 
    'Loratadine', 'Omeprazole', 'Aspirin'
  ];

  return (
    <div className="medicine-search" style={{ padding: '1.5rem' }}>
      <h3 style={{ color: '#00BCD4', marginBottom: '1rem' }}>
        💊 Medicine Information
      </h3>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchMedicine()}
            placeholder="Search medicine name..."
            style={{
              flex: 1,
              padding: '0.875rem 1rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
          <button
            onClick={searchMedicine}
            disabled={loading || !query.trim()}
            style={{
              padding: '0.875rem 1.5rem',
              background: loading || !query.trim() ? '#ccc' : '#00BCD4',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
              fontWeight: '600'
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Quick search:
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {commonMedicines.map(med => (
              <button
                key={med}
                onClick={() => {
                  setQuery(med);
                  setTimeout(() => searchMedicine(), 100);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                {med}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          background: '#ffebee',
          color: '#c62828',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {result && result.found && (
        <div style={{
          background: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '12px',
          borderLeft: '4px solid #00BCD4'
        }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#00BCD4', fontSize: '1.25rem' }}>
            {result.medicine.name}
          </h4>

          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#666', margin: '0.25rem 0' }}>
              <strong>Generic:</strong> {result.medicine.generic}
            </p>
            <p style={{ fontSize: '0.875rem', color: '#666', margin: '0.25rem 0' }}>
              <strong>Brand Examples:</strong> {result.medicine.brand_examples.join(', ')}
            </p>
            <p style={{ fontSize: '0.875rem', color: '#666', margin: '0.25rem 0' }}>
              <strong>Category:</strong> {result.category}
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#333' }}>Common Uses:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              {result.medicine.uses.map((use: string, i: number) => (
                <li key={i} style={{ marginBottom: '0.25rem', color: '#555' }}>
                  {use}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#666' }}>
              <strong>Age Guidance:</strong> {result.medicine.age_restrictions}
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#333' }}>Important Notes:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              {result.medicine.warnings.map((warning: string, i: number) => (
                <li key={i} style={{ marginBottom: '0.25rem', color: '#d32f2f' }}>
                  ⚠️ {warning}
                </li>
              ))}
            </ul>
          </div>

          <div style={{
            background: '#FFF3CD',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #FFC107',
            marginTop: '1rem'
          }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#856404' }}>
              {result.disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
