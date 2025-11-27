/**
 * ReportDownload Component
 * Generate and download health reports
 */

'use client';

import { useState, useEffect } from 'react';

interface ReportData {
  report_id: string;
  generated_at: string;
  user_info: {
    name: string;
    age?: number;
    gender?: string;
  };
  session_info: {
    session_id: string;
    date: string;
  };
  symptoms_discussed: string[];
  possible_causes: Array<{
    name: string;
    description: string;
  }>;
  recommendations: string[];
  severity_level: string;
  doctor_consultation_advice: string;
  motivational_message: string;
}

interface UserReport {
  report_id: number;
  session_id: string;
  generated_at: string;
  file_path: string;
}

interface ReportDownloadProps {
  sessionData?: {
    session_id: string;
    symptoms: string[];
    analysis: any;
  };
  userData?: {
    name: string;
    age?: number;
    gender?: string;
  };
}

export function ReportDownload({ sessionData, userData }: ReportDownloadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null);
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadUserReports();
  }, []);

  const loadUserReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/report/list/1');
      const data = await response.json();
      setUserReports(data.reports || []);
    } catch (err) {
      console.error('Failed to load user reports');
    }
  };

  const generateReport = async () => {
    if (!sessionData || !userData) {
      setError('Missing session or user data');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          user_data: userData,
          session_data: {
            session_id: sessionData.session_id,
            date: new Date().toISOString()
          },
          symptoms: sessionData.symptoms,
          analysis: sessionData.analysis
        })
      });

      const data = await response.json();
      setGeneratedReport(data.report_data);
      setShowPreview(true);
      loadUserReports();
    } catch (err) {
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (reportData: ReportData) => {
    const htmlContent = generateHTMLReport(reportData);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MediChat_Report_${reportData.report_id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateHTMLReport = (reportData: ReportData): string => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>MediChat Health Report</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6; }
        .header { background: linear-gradient(135deg, #00BCD4 0%, #0097A7 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
        .section { background: #f5f5f5; padding: 20px; margin-bottom: 20px; border-radius: 8px; border-left: 4px solid #00BCD4; }
        .section h2 { color: #00BCD4; margin-top: 0; }
        ul { list-style: none; padding: 0; }
        ul li:before { content: "✓ "; color: #00BCD4; font-weight: bold; }
        .disclaimer { background: #fff3cd; border: 2px solid #ffc107; padding: 15px; border-radius: 8px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>⚕️ MediChat Health Report</h1>
        <p>Report ID: ${reportData.report_id}</p>
        <p>${new Date(reportData.generated_at).toLocaleString()}</p>
    </div>
    <div class="section">
        <h2>Patient Information</h2>
        <p><strong>Name:</strong> ${reportData.user_info.name}</p>
        <p><strong>Age:</strong> ${reportData.user_info.age || 'N/A'}</p>
        <p><strong>Severity:</strong> ${reportData.severity_level}</p>
    </div>
    <div class="section">
        <h2>Symptoms Discussed</h2>
        <ul>${reportData.symptoms_discussed.map(s => `<li>${s}</li>`).join('')}</ul>
    </div>
    <div class="section">
        <h2>Recommendations</h2>
        <ul>${reportData.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
    </div>
    <div class="disclaimer">
        <strong>⚠️ DISCLAIMER:</strong> This report is for informational purposes only. ${reportData.doctor_consultation_advice}
    </div>
</body>
</html>`;
  };

  return (
    <div className="report-download" style={{ padding: '1.5rem' }}>
      <h3 style={{ color: '#00BCD4', marginBottom: '1rem' }}>📄 Health Reports</h3>
      
      {sessionData && (
        <button
          onClick={generateReport}
          disabled={loading}
          style={{
            width: '100%',
            padding: '1rem',
            background: loading ? '#ccc' : '#00BCD4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            marginBottom: '1rem'
          }}
        >
          {loading ? 'Generating...' : '📥 Generate Report'}
        </button>
      )}

      {generatedReport && showPreview && (
        <div style={{
          background: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '1rem'
        }}>
          <h4 style={{ color: '#333', marginBottom: '1rem' }}>Report Preview</h4>
          <p><strong>Report ID:</strong> {generatedReport.report_id}</p>
          <p><strong>Generated:</strong> {new Date(generatedReport.generated_at).toLocaleString()}</p>
          <button
            onClick={() => downloadReport(generatedReport)}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            💾 Download Report
          </button>
        </div>
      )}

      {error && (
        <div style={{
          background: '#ffebee',
          padding: '1rem',
          borderRadius: '8px',
          color: '#c62828',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      <button
        onClick={() => setShowHistory(!showHistory)}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: 'white',
          border: '2px solid #00BCD4',
          borderRadius: '8px',
          color: '#00BCD4',
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        {showHistory ? '▼' : '▶'} Report History ({userReports.length})
      </button>

      {showHistory && userReports.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          {userReports.map((report, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                marginBottom: '0.5rem'
              }}
            >
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>
                <strong>Session:</strong> {report.session_id}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>
                {new Date(report.generated_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
