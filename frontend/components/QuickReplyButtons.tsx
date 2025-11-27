/**
 * QuickReplyButtons Component
 * Displays clickable button options for user responses
 * Used throughout the app for interactive question flows
 */

import React from 'react';

interface QuickReplyButtonsProps {
  options: string[];
  onSelect: (option: string) => void;
  multiple?: boolean;
  selected?: string[];
  disabled?: boolean;
  columns?: number;
}

export function QuickReplyButtons({
  options,
  onSelect,
  multiple = false,
  selected = [],
  disabled = false,
  columns = 2
}: QuickReplyButtonsProps) {
  const handleClick = (option: string) => {
    if (disabled) return;
    onSelect(option);
  };

  const isSelected = (option: string) => {
    return selected.includes(option);
  };

  return (
    <div 
      className="quick-reply-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '0.75rem',
        marginTop: '1rem',
        marginBottom: '1rem'
      }}
    >
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => handleClick(option)}
          disabled={disabled}
          className={`quick-reply-btn ${isSelected(option) ? 'selected' : ''}`}
          style={{
            padding: '0.875rem 1rem',
            border: isSelected(option) ? '2px solid #00BCD4' : '2px solid #e0e0e0',
            borderRadius: '12px',
            background: isSelected(option) ? '#E0F7FA' : 'white',
            color: isSelected(option) ? '#00838F' : '#333',
            fontSize: '0.9375rem',
            fontWeight: isSelected(option) ? '600' : '500',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'center',
            opacity: disabled ? 0.6 : 1,
            boxShadow: isSelected(option) 
              ? '0 2px 8px rgba(0, 188, 212, 0.2)' 
              : '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={(e) => {
            if (!disabled && !isSelected(option)) {
              e.currentTarget.style.borderColor = '#00BCD4';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && !isSelected(option)) {
              e.currentTarget.style.borderColor = '#e0e0e0';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

// Compact version for inline use
export function QuickReplyButtonsInline({
  options,
  onSelect,
  selected = [],
  disabled = false
}: Omit<QuickReplyButtonsProps, 'columns' | 'multiple'>) {
  return (
    <div 
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '0.5rem'
      }}
    >
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => onSelect(option)}
          disabled={disabled}
          className={`quick-reply-btn-inline ${selected.includes(option) ? 'selected' : ''}`}
          style={{
            padding: '0.5rem 1rem',
            border: selected.includes(option) ? '2px solid #00BCD4' : '1px solid #e0e0e0',
            borderRadius: '20px',
            background: selected.includes(option) ? '#E0F7FA' : 'white',
            color: selected.includes(option) ? '#00838F' : '#666',
            fontSize: '0.875rem',
            fontWeight: selected.includes(option) ? '600' : '500',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

// Icon button version
interface IconButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  selected?: boolean;
  disabled?: boolean;
}

export function IconButton({
  icon,
  label,
  onClick,
  selected = false,
  disabled = false
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        border: selected ? '2px solid #00BCD4' : '2px solid #e0e0e0',
        borderRadius: '12px',
        background: selected ? '#E0F7FA' : 'white',
        color: selected ? '#00838F' : '#333',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        minWidth: '100px',
        opacity: disabled ? 0.6 : 1
      }}
    >
      <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: selected ? '600' : '500' }}>
        {label}
      </span>
    </button>
  );
}
