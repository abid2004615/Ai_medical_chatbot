/**
 * Resources Page
 * Medicine information and health resources
 */

'use client';

import { useState } from 'react';
import { MedicineSearch } from '@/components/MedicineSearch';
import { RashQuestionFlow } from '@/components/RashQuestionFlow';

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState<'medicine' | 'rash'>('medicine');

  return (
    <>
      <div className="resources-page" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #E0F7FA 0%, #B2EBF2 100%)',
        padding: '2rem 1rem'
      }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            color: '#00838F',
            marginBottom: '0.5rem',
            fontWeight: 'bold'
          }}>
            📚 Health Resources
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: '#00838F',
            opacity: 0.8
          }}>
            Educational information about medicines and common health conditions
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveTab('medicine')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'medicine' ? '#00BCD4' : 'white',
              color: activeTab === 'medicine' ? 'white' : '#00BCD4',
              border: '2px solid #00BCD4',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'medicine' ? '0 4px 12px rgba(0,188,212,0.3)' : 'none'
            }}
          >
            💊 Medicine Information
          </button>
          <button
            onClick={() => setActiveTab('rash')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'rash' ? '#00BCD4' : 'white',
              color: activeTab === 'rash' ? 'white' : '#00BCD4',
              border: '2px solid #00BCD4',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'rash' ? '0 4px 12px rgba(0,188,212,0.3)' : 'none'
            }}
          >
            🔬 Medical Image Analysis
          </button>
        </div>

        {/* Info Banner */}
        {activeTab === 'medicine' && (
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #00BCD4'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#00838F' }}>
              💊 About Medicine Information
            </h3>
            <p style={{ margin: 0, color: '#666', lineHeight: '1.6' }}>
              Search for over-the-counter (OTC) medicines to learn about their uses, age restrictions, 
              and important warnings. This is educational information only - always consult a doctor 
              or pharmacist before using any medication.
            </p>
          </div>
        )}

        {activeTab === 'rash' && (
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #00BCD4'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#00838F' }}>
              🔬 About Medical Image Analysis
            </h3>
            <p style={{ margin: 0, color: '#666', lineHeight: '1.6' }}>
              Answer a few questions about your rash to learn about possible causes and general care 
              suggestions. This tool provides educational information only and is not a substitute for 
              professional medical diagnosis.
            </p>
          </div>
        )}

        {/* Content Area */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {activeTab === 'medicine' && <MedicineSearch />}
          {activeTab === 'rash' && <RashQuestionFlow />}
        </div>

        {/* Important Notice */}
        <div style={{
          marginTop: '2rem',
          background: '#FFF3CD',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '2px solid #FFC107',
          textAlign: 'center'
        }}>
          <p style={{ 
            margin: 0, 
            color: '#856404', 
            fontWeight: '600',
            fontSize: '1rem'
          }}>
            ⚠️ IMPORTANT DISCLAIMER
          </p>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            color: '#856404',
            lineHeight: '1.6'
          }}>
            All information provided is for general guidance and should not be considered 
            medical advice. Always consult with a qualified healthcare provider for proper diagnosis 
            and treatment of any health condition.
          </p>
        </div>

        {/* Quick Links */}
        <div style={{
          marginTop: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <a
            href="/chat"
            style={{
              display: 'block',
              padding: '1.5rem',
              background: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#333',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#00BCD4' }}>Chat with MediChat</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
              Get personalized health advice through our AI assistant
            </p>
          </a>

          <a
            href="/dashboard"
            style={{
              display: 'block',
              padding: '1.5rem',
              background: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#333',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#00BCD4' }}>Health Dashboard</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
              Track your health progress with weekly check-ins
            </p>
          </a>

          <a
            href="/reports"
            style={{
              display: 'block',
              padding: '1.5rem',
              background: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#333',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#00BCD4' }}>Health Reports</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
              View and download your consultation reports
            </p>
          </a>
        </div>
      </div>
    </div>
    </>
  );
}
