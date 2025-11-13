"use client"

import { SeverityInfo } from "@/lib/api-client"

interface SeverityIndicatorProps {
  severity: SeverityInfo
}

export function SeverityIndicator({ severity }: SeverityIndicatorProps) {
  const getSeverityColor = (level: string): string => {
    switch (level) {
      case 'EMERGENCY':
        return '#dc2626'
      case 'HIGH':
        return '#ea580c'
      case 'MODERATE':
        return '#f59e0b'
      case 'LOW':
        return '#3b82f6'
      case 'MINIMAL':
        return '#10b981'
      default:
        return '#6b7280'
    }
  }

  const getSeverityIcon = (level: string): string => {
    switch (level) {
      case 'EMERGENCY':
        return '🚨'
      case 'HIGH':
        return '⚠️'
      case 'MODERATE':
        return '⚡'
      case 'LOW':
        return 'ℹ️'
      case 'MINIMAL':
        return '✓'
      default:
        return '•'
    }
  }

  const color = getSeverityColor(severity.level)
  const icon = getSeverityIcon(severity.level)

  return (
    <div style={{
      background: `${color}10`,
      border: `2px solid ${color}`,
      borderRadius: "8px",
      padding: "1rem",
      marginBottom: "1rem"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "1.5rem" }}>{icon}</span>
        <h4 style={{ 
          margin: 0, 
          fontSize: "1rem", 
          fontWeight: "600",
          color: color
        }}>
          {severity.level} SEVERITY
        </h4>
        <span style={{
          marginLeft: "auto",
          padding: "0.25rem 0.75rem",
          background: color,
          color: "white",
          borderRadius: "12px",
          fontSize: "0.875rem",
          fontWeight: "600"
        }}>
          {severity.score}/100
        </span>
      </div>

      <p style={{ 
        margin: "0.5rem 0", 
        fontSize: "0.875rem", 
        color: "#374151",
        lineHeight: "1.5"
      }}>
        {severity.message}
      </p>

      {severity.keywords.length > 0 && (
        <div style={{ marginTop: "0.75rem" }}>
          <p style={{ 
            margin: "0 0 0.5rem 0", 
            fontSize: "0.75rem", 
            color: "#6b7280",
            fontWeight: "600"
          }}>
            Detected Symptoms:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {severity.keywords.map((keyword, index) => (
              <span
                key={index}
                style={{
                  padding: "0.25rem 0.75rem",
                  background: `${color}20`,
                  color: color,
                  borderRadius: "12px",
                  fontSize: "0.75rem",
                  fontWeight: "500"
                }}
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
