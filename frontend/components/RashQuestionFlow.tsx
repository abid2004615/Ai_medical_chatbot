/**
 * RashQuestionFlow Component
 * Interactive rash detection with step-by-step questions
 */

'use client';

import { useState, useEffect } from 'react';
import { QuickReplyButtons } from './QuickReplyButtons';

interface Question {
  id: string;
  question: string;
  options: string[];
  required: boolean;
  multiple?: boolean;
}

interface RashAnalysis {
  likely_causes: Array<{
    type: string;
    score: number;
    description: string;
    care_tips: string[];
  }>;
  disclaimer: string;
}

export function RashQuestionFlow() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<RashAnalysis | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rash/questions');
      const data = await response.json();
      setQuestions(data.questions);
    } catch (err) {
      setError('Failed to load questions');
    }
  };

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Auto-advance for single-select questions
    if (!questions[currentStep]?.multiple) {
      setTimeout(() => {
        if (currentStep < questions.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      }, 300);
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      analyzeRash();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const analyzeRash = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/rash/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers)
      });

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError('Failed to analyze rash');
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setCurrentStep(0);
    setAnswers({});
    setAnalysis(null);
    setError('');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="loading-spinner" style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #00BCD4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p>Analyzing your symptoms...</p>
      </div>
    );
  }

  if (analysis) {
    return (
      <div className="rash-analysis-results" style={{ padding: '1.5rem' }}>
        <h3 style={{ color: '#00BCD4', marginBottom: '1rem' }}>
          🔍 Rash Analysis Results
        </h3>

        {analysis.likely_causes.map((cause, index) => (
          <div 
            key={index}
            style={{
              background: '#f8f9fa',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '1rem',
              borderLeft: '4px solid #00BCD4'
            }}
          >
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
              {index + 1}. {cause.type}
            </h4>
            <p style={{ color: '#666', marginBottom: '1rem', lineHeight: '1.6' }}>
              {cause.description}
            </p>
            
            <div style={{ marginTop: '1rem' }}>
              <strong style={{ color: '#00838F' }}>Care Tips:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                {cause.care_tips.map((tip, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem', color: '#555' }}>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}

        <div style={{
          background: '#FFF3CD',
          padding: '1rem',
          borderRadius: '8px',
          marginTop: '1.5rem',
          border: '1px solid #FFC107'
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#856404' }}>
            ⚠️ {analysis.disclaimer}
          </p>
        </div>

        <button
          onClick={resetFlow}
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem 1.5rem',
            background: '#00BCD4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Start New Analysis
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div>Loading questions...</div>;
  }

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="rash-question-flow" style={{ padding: '1.5rem' }}>
      {/* Progress Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          color: '#666'
        }}>
          <span>Question {currentStep + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div style={{
          height: '8px',
          background: '#e0e0e0',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #00BCD4 0%, #00838F 100%)',
            width: `${progress}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          color: '#333', 
          marginBottom: '1rem',
          lineHeight: '1.4'
        }}>
          {currentQuestion.question}
        </h3>

        {currentQuestion.multiple && (
          <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
            Select all that apply
          </p>
        )}

        <QuickReplyButtons
          options={currentQuestion.options}
          onSelect={(option) => {
            if (currentQuestion.multiple) {
              const current = answers[currentQuestion.id] || [];
              const updated = current.includes(option)
                ? current.filter((o: string) => o !== option)
                : [...current, option];
              handleAnswer(currentQuestion.id, updated);
            } else {
              handleAnswer(currentQuestion.id, option);
            }
          }}
          multiple={currentQuestion.multiple}
          selected={
            currentQuestion.multiple
              ? answers[currentQuestion.id] || []
              : answers[currentQuestion.id] ? [answers[currentQuestion.id]] : []
          }
          columns={2}
        />
      </div>

      {/* Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginTop: '2rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e0e0e0'
      }}>
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'white',
            color: '#00BCD4',
            border: '2px solid #00BCD4',
            borderRadius: '8px',
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            opacity: currentStep === 0 ? 0.5 : 1
          }}
        >
          ← Back
        </button>

        {currentQuestion.multiple && (
          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]?.length}
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              background: answers[currentQuestion.id]?.length ? '#00BCD4' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: answers[currentQuestion.id]?.length ? 'pointer' : 'not-allowed',
              fontWeight: '600'
            }}
          >
            {currentStep === questions.length - 1 ? 'Analyze →' : 'Next →'}
          </button>
        )}
      </div>

      {error && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: '#ffebee',
          color: '#c62828',
          borderRadius: '8px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
