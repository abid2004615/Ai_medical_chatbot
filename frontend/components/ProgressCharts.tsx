/**
 * ProgressCharts Component
 * Visual health trend charts and progress tracking
 */

'use client';

import { useState, useEffect } from 'react';

interface TrendData {
  trend: string;
  average_score: number;
  score_change: number;
  message: string;
  data: Array<{
    date: string;
    score: number;
    new_symptoms: string;
    symptom_changes: string;
  }>;
}

interface ProgressChartsProps {
  userId?: number;
  weeks?: number;
}

export function ProgressCharts({ userId = 1, weeks = 4 }: ProgressChartsProps) {
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWeeks, setSelectedWeeks] = useState(weeks);

  useEffect(() => {
    loadTrends();
  }, [selectedWeeks]);

  const loadTrends = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `http://localhost:5000/api/weekly/trends/${userId}?weeks=${selectedWeeks}`
      );
      const data = await response.json();
      setTrends(data);
    } catch (err) {
      setError('Failed to load health trends');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    if (score >= 40) return '#FF5722';
    return '#F44336';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '📊';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #00BCD4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p>Loading trends...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: '#ffebee',
        padding: '2rem',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#c62828'
      }}>
        <p>{error}</p>
        <button
          onClick={loadTrends}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: '#00BCD4',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!trends || trends.trend === 'no_data') {
    return (
      <div style={{
        background: '#e3f2fd',
        padding: '2rem',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#1976d2'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
        <p>No health data available yet.</p>
        <p style={{ fontSize: '0.875rem' }}>
          Complete weekly check-ins to see your trends!
        </p>
      </div>
    );
  }

  return (
    <div className="progress-charts" style={{ padding: '1.5rem' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <h3 style={{ color: '#00BCD4', margin: 0 }}>📈 Health Progress</h3>
        
        <select
          value={selectedWeeks}
          onChange={(e) => setSelectedWeeks(Number(e.target.value))}
          style={{
            padding: '0.5rem',
            border: '2px solid #e0e0e0',
            borderRadius: '6px',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          <option value={2}>Last 2 weeks</option>
          <option value={4}>Last 4 weeks</option>
          <option value={8}>Last 8 weeks</option>
          <option value={12}>Last 12 weeks</option>
        </select>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '2px solid #e0e0e0',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: getScoreColor(trends.average_score)
          }}>
            {trends.average_score.toFixed(1)}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>Average Score</div>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '2px solid #e0e0e0',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {trends.score_change >= 0 ? '📈' : '📉'}
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: trends.score_change >= 0 ? '#4CAF50' : '#F44336'
          }}>
            {trends.score_change >= 0 ? '+' : ''}{trends.score_change.toFixed(1)}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>Score Change</div>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '2px solid #e0e0e0',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {getTrendIcon(trends.trend)}
          </div>
          <div style={{
            fontSize: '1rem',
            fontWeight: 'bold',
            textTransform: 'capitalize'
          }}>
            {trends.trend}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>Overall Trend</div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: '#333', marginBottom: '1rem' }}>📊 Weekly Scores</h4>
        <div style={{
          display: 'flex',
          alignItems: 'end',
          justifyContent: 'space-between',
          height: '200px',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '12px',
          border: '2px solid #e0e0e0'
        }}>
          {trends.data.map((item, index) => {
            const height = (item.score / 100) * 150;
            return (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1
                }}
              >
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  {item.score}
                </div>
                <div style={{
                  width: '100%',
                  maxWidth: '40px',
                  height: `${height}px`,
                  background: getScoreColor(item.score),
                  borderRadius: '4px 4px 0 0',
                  marginBottom: '0.5rem'
                }} />
                <div style={{
                  fontSize: '0.75rem',
                  color: '#666',
                  textAlign: 'center'
                }}>
                  {formatDate(item.date)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p style={{ color: '#555', fontSize: '0.9375rem', lineHeight: '1.5' }}>
        {trends.message}
      </p>
    </div>
  );
}
