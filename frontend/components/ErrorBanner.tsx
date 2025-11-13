"use client"

import { useState, useEffect } from "react"
import { ApiError, ErrorType } from "@/lib/api-client"

export enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  CHECKING = 'CHECKING',
  UNKNOWN = 'UNKNOWN'
}

interface ErrorBannerProps {
  error: ApiError | null
  onRetry?: () => void
  onDismiss?: () => void
  showTroubleshooting?: boolean
  connectionStatus?: ConnectionStatus
}

export function ErrorBanner({
  error,
  onRetry,
  onDismiss,
  showTroubleshooting = true,
  connectionStatus = ConnectionStatus.UNKNOWN
}: ErrorBannerProps) {
  const [showTips, setShowTips] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  // Auto-dismiss for transient errors after 5 seconds
  useEffect(() => {
    if (error && error.retryable && !showTips) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onDismiss?.()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [error, showTips, onDismiss])

  // Reset visibility when error changes
  useEffect(() => {
    setIsVisible(true)
  }, [error])

  if (!error || !isVisible) return null

  const getTroubleshootingTips = (errorType: ErrorType): string[] => {
    switch (errorType) {
      case ErrorType.BACKEND_NOT_RUNNING:
        return [
          "Make sure the Flask backend server is running on port 5000",
          "Navigate to the backend directory and run: python app.py",
          "Check if port 5000 is already in use by another application",
          "Verify your .env file contains the required API keys"
        ]
      case ErrorType.CONNECTION_REFUSED:
        return [
          "Check your internet connection",
          "Verify the backend server is running",
          "Try refreshing the page",
          "Check if a firewall is blocking the connection"
        ]
      case ErrorType.TIMEOUT:
        return [
          "Check your internet connection speed",
          "The server might be experiencing high load - try again in a moment",
          "Try reducing the size of uploaded files"
        ]
      case ErrorType.SERVER_ERROR:
        return [
          "The server encountered an internal error",
          "Check the backend console for error messages",
          "Try again in a few moments",
          "If the problem persists, check the server logs"
        ]
      case ErrorType.NETWORK_ERROR:
        return [
          "Check your internet connection",
          "Try disabling VPN or proxy if you're using one",
          "Check if your browser is blocking the request",
          "Try using a different browser"
        ]
      default:
        return [
          "Try refreshing the page",
          "Check your internet connection",
          "Clear your browser cache",
          "If the problem persists, contact support"
        ]
    }
  }

  const getStatusColor = (status: ConnectionStatus): string => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return "var(--success, #10b981)"
      case ConnectionStatus.DISCONNECTED:
        return "var(--error, #ef4444)"
      case ConnectionStatus.CHECKING:
        return "var(--warning, #f59e0b)"
      default:
        return "var(--text-tertiary, #9ca3af)"
    }
  }

  const getStatusText = (status: ConnectionStatus): string => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return "Connected"
      case ConnectionStatus.DISCONNECTED:
        return "Disconnected"
      case ConnectionStatus.CHECKING:
        return "Checking..."
      default:
        return "Unknown"
    }
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
      border: "1px solid var(--error, #ef4444)",
      borderRadius: "12px",
      padding: "1rem",
      marginBottom: "1rem",
      boxShadow: "0 2px 8px rgba(239, 68, 68, 0.1)"
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>⚠️</span>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <h4 style={{ 
              margin: 0, 
              fontSize: "1rem", 
              fontWeight: "600",
              color: "var(--error, #ef4444)"
            }}>
              {error.userMessage}
            </h4>
            
            {connectionStatus !== ConnectionStatus.UNKNOWN && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: getStatusColor(connectionStatus),
                  animation: connectionStatus === ConnectionStatus.CHECKING ? "pulse 2s infinite" : "none"
                }} />
                <span style={{ 
                  fontSize: "0.75rem", 
                  color: getStatusColor(connectionStatus),
                  fontWeight: "500"
                }}>
                  {getStatusText(connectionStatus)}
                </span>
              </div>
            )}
          </div>

          {process.env.NODE_ENV === 'development' && (
            <p style={{ 
              margin: "0.5rem 0", 
              fontSize: "0.875rem", 
              color: "var(--text-secondary, #6b7280)",
              fontFamily: "monospace",
              background: "rgba(255, 255, 255, 0.5)",
              padding: "0.5rem",
              borderRadius: "4px"
            }}>
              Technical: {error.technicalMessage}
            </p>
          )}

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
            {onRetry && error.retryable && (
              <button
                onClick={onRetry}
                style={{
                  padding: "0.5rem 1rem",
                  background: "var(--primary, #0ABABA)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "var(--primary-dark, #0097A7)"}
                onMouseOut={(e) => e.currentTarget.style.background = "var(--primary, #0ABABA)"}
              >
                🔄 Retry
              </button>
            )}

            {showTroubleshooting && (
              <button
                onClick={() => setShowTips(!showTips)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "white",
                  color: "var(--error, #ef4444)",
                  border: "1px solid var(--error, #ef4444)",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {showTips ? "Hide" : "Show"} Troubleshooting Tips
              </button>
            )}

            {onDismiss && (
              <button
                onClick={() => {
                  setIsVisible(false)
                  onDismiss()
                }}
                style={{
                  padding: "0.5rem 1rem",
                  background: "transparent",
                  color: "var(--text-secondary, #6b7280)",
                  border: "1px solid var(--text-tertiary, #9ca3af)",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Dismiss
              </button>
            )}
          </div>

          {showTips && (
            <div style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "white",
              borderRadius: "8px",
              border: "1px solid rgba(239, 68, 68, 0.2)"
            }}>
              <h5 style={{ 
                margin: "0 0 0.75rem 0", 
                fontSize: "0.875rem", 
                fontWeight: "600",
                color: "var(--text-primary, #001B2E)"
              }}>
                Troubleshooting Steps:
              </h5>
              <ul style={{ 
                margin: 0, 
                paddingLeft: "1.5rem",
                fontSize: "0.875rem",
                color: "var(--text-secondary, #6b7280)",
                lineHeight: "1.6"
              }}>
                {getTroubleshootingTips(error.type).map((tip, index) => (
                  <li key={index} style={{ marginBottom: "0.5rem" }}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}
