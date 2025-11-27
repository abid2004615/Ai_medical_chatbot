/**
 * WeeklyCheckIn Component
 * Weekly health monitoring check-in form
 */

'use client';

import { useState } from 'react';
import { QuickReplyButtons } from './QuickReplyButtons';

export function WeeklyCheckIn({ userId }: { userId: number }) {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const questions = [
    {
      id: 'overall_health',
      text: 'How would you rate your overall health this week?',
      options: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'],
      scores: [1, 2, 3, 4, 5]
    },
    {
      id: 'new_symptoms',
      text: 'Have you experienced any new symptoms this week?',
      options: ['Yes', 'No']
    },
    {
      id: 'previous_symptoms',
      text: 'How are your previous symptoms?',
      options: ['Much better', 'Somewhat better', 'About the same', 'Somewhat worse', 'Much worse', 'No previous symptoms']
    },
    {
      id: 'sleep_quality',
      text: 'How has your sleep been this week?',
      options: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'],
      scores: [1, 2, 3, 4, 5]
    },
    {
      id: 'stress_level',
      text: 'What has your stress level been like?',
      options: ['Very High', 'High', 'Moderate', 'Low', 'Very Low'],
      scores: [1, 2, 3, 4, 5]
    }
  ];

  const handleAnswer = (answer: string) => {
    const currentQ = questions[step];
    const scoreIndex = currentQ.options.indexOf(answer);
    const score = currentQ.scores ? currentQ.scores[scoreIndex] : null;

    setResponses(prev => ({
      ...prev,
      [currentQ.id]: score || answer
    }));

    setTimeout(() => {
      if (step < questions.length - 1) {
        setStep(step + 1);
      } else {
        submitCheckIn({ ...responses, [currentQ.id]: score || answer });
      }
    }, 300);
  };

  const submitCheckIn = async (finalResponses: Record<string, any>) => {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/weekly/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          responses: finalResponses
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ error: 'Failed to submit check-in' });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setResponses({});
    setResult(null);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Submitting your check-in...</p>
      </div>
    );
  }

  if (result) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <div style={{
          background: result.error ? '#ffebee' : '#e8f5e9',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          {result.error ? (
            <p style={{ color: '#c62828' }}>{result.error}</p>
          ) : (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {result.health_score >= 80 ? '🌟' : result.health_score >= 60 ? '👍' : '💪'}
              </div>
              <h3 style={{ color: '#2e7d32', marginBottom: '1rem' }}>
                Health Score: {result.health_score}/100
              </h3>
              <p style={{ color: '#555', lineHeight: '1.6' }}>
                {result.message}
              </p>
            </>
          )}
        </div>
        <button
          onClick={reset}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: '#00BCD4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            width: '100%'
          }}
        >
          Complete Another Check-in
        </button>
      </div>
    );
  }

  const currentQ = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  return (
    <div style={{ padding: '1.5rem' }}>
      <h3 style={{ color: '#00BCD4', marginBottom: '1rem' }}>
        📊 Weekly Health Check-in
      </h3>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          height: '8px',
          background: '#e0e0e0',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: '#00BCD4',
            width: `${progress}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>
        <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
          Question {step + 1} of {questions.length}
        </p>
      </div>

      <h4 style={{ marginBottom: '1rem', color: '#333' }}>
        {currentQ.text}
      </h4>

      <QuickReplyButtons
        options={currentQ.options}
        onSelect={handleAnswer}
        selected={responses[currentQ.id] ? [responses[currentQ.id]] : []}
        columns={2}
      />
    </div>
  );
}
