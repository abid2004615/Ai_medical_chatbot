/**
 * Tests for ErrorBanner component
 * 
 * These tests verify:
 * - Rendering with different error types
 * - Retry button functionality
 * - Auto-dismiss behavior
 * - Connection status display
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ErrorBanner, ConnectionStatus } from '@/components/ErrorBanner'
import { ApiError, ErrorType } from '@/lib/api-client'

describe('ErrorBanner Component', () => {
  const mockRetry = jest.fn()
  const mockDismiss = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should not render when error is null', () => {
      const { container } = render(
        <ErrorBanner error={null} />
      )
      expect(container.firstChild).toBeNull()
    })

    it('should render error message', () => {
      const error = new ApiError(
        0,
        'Technical error',
        undefined,
        ErrorType.BACKEND_NOT_RUNNING
      )

      render(<ErrorBanner error={error} />)
      
      expect(screen.getByText(/Backend server is not running/i)).toBeInTheDocument()
    })

    it('should show connection status when provided', () => {
      const error = new ApiError(0, 'Error', undefined, ErrorType.NETWORK_ERROR)

      render(
        <ErrorBanner 
          error={error} 
          connectionStatus={ConnectionStatus.DISCONNECTED}
        />
      )
      
      expect(screen.getByText('Disconnected')).toBeInTheDocument()
    })

    it('should show technical message in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const error = new ApiError(
        500,
        'Detailed technical error',
        undefined,
        ErrorType.SERVER_ERROR
      )

      render(<ErrorBanner error={error} />)
      
      expect(screen.getByText(/Technical:/)).toBeInTheDocument()
      expect(screen.getByText(/Detailed technical error/)).toBeInTheDocument()

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Retry Button', () => {
    it('should show retry button for retryable errors', () => {
      const error = new ApiError(
        500,
        'Server error',
        undefined,
        ErrorType.SERVER_ERROR
      )

      render(<ErrorBanner error={error} onRetry={mockRetry} />)
      
      expect(screen.getByText(/Retry/i)).toBeInTheDocument()
    })

    it('should not show retry button for non-retryable errors', () => {
      const error = new ApiError(
        0,
        'Backend not running',
        undefined,
        ErrorType.BACKEND_NOT_RUNNING
      )

      render(<ErrorBanner error={error} onRetry={mockRetry} />)
      
      expect(screen.queryByText(/Retry/i)).not.toBeInTheDocument()
    })

    it('should call onRetry when retry button is clicked', () => {
      const error = new ApiError(
        500,
        'Server error',
        undefined,
        ErrorType.SERVER_ERROR
      )

      render(<ErrorBanner error={error} onRetry={mockRetry} />)
      
      const retryButton = screen.getByText(/Retry/i)
      fireEvent.click(retryButton)
      
      expect(mockRetry).toHaveBeenCalledTimes(1)
    })
  })

  describe('Troubleshooting Tips', () => {
    it('should show troubleshooting button when enabled', () => {
      const error = new ApiError(
        0,
        'Error',
        undefined,
        ErrorType.BACKEND_NOT_RUNNING
      )

      render(
        <ErrorBanner 
          error={error} 
          showTroubleshooting={true}
        />
      )
      
      expect(screen.getByText(/Show.*Troubleshooting Tips/i)).toBeInTheDocument()
    })

    it('should toggle troubleshooting tips on button click', () => {
      const error = new ApiError(
        0,
        'Error',
        undefined,
        ErrorType.BACKEND_NOT_RUNNING
      )

      render(<ErrorBanner error={error} showTroubleshooting={true} />)
      
      const toggleButton = screen.getByText(/Show.*Troubleshooting Tips/i)
      
      // Tips should not be visible initially
      expect(screen.queryByText(/Troubleshooting Steps:/i)).not.toBeInTheDocument()
      
      // Click to show tips
      fireEvent.click(toggleButton)
      expect(screen.getByText(/Troubleshooting Steps:/i)).toBeInTheDocument()
      
      // Click to hide tips
      fireEvent.click(toggleButton)
      expect(screen.queryByText(/Troubleshooting Steps:/i)).not.toBeInTheDocument()
    })

    it('should show appropriate tips for backend not running error', () => {
      const error = new ApiError(
        0,
        'Error',
        undefined,
        ErrorType.BACKEND_NOT_RUNNING
      )

      render(<ErrorBanner error={error} showTroubleshooting={true} />)
      
      const toggleButton = screen.getByText(/Show.*Troubleshooting Tips/i)
      fireEvent.click(toggleButton)
      
      expect(screen.getByText(/Flask backend server is running on port 5000/i)).toBeInTheDocument()
    })
  })

  describe('Dismiss Functionality', () => {
    it('should show dismiss button when onDismiss is provided', () => {
      const error = new ApiError(0, 'Error', undefined, ErrorType.NETWORK_ERROR)

      render(<ErrorBanner error={error} onDismiss={mockDismiss} />)
      
      expect(screen.getByText('Dismiss')).toBeInTheDocument()
    })

    it('should call onDismiss when dismiss button is clicked', () => {
      const error = new ApiError(0, 'Error', undefined, ErrorType.NETWORK_ERROR)

      render(<ErrorBanner error={error} onDismiss={mockDismiss} />)
      
      const dismissButton = screen.getByText('Dismiss')
      fireEvent.click(dismissButton)
      
      expect(mockDismiss).toHaveBeenCalledTimes(1)
    })

    it('should auto-dismiss retryable errors after 5 seconds', async () => {
      jest.useFakeTimers()

      const error = new ApiError(
        500,
        'Server error',
        undefined,
        ErrorType.SERVER_ERROR
      )

      render(<ErrorBanner error={error} onDismiss={mockDismiss} />)
      
      // Fast-forward time by 5 seconds
      jest.advanceTimersByTime(5000)
      
      await waitFor(() => {
        expect(mockDismiss).toHaveBeenCalledTimes(1)
      })

      jest.useRealTimers()
    })

    it('should not auto-dismiss when troubleshooting tips are shown', async () => {
      jest.useFakeTimers()

      const error = new ApiError(
        500,
        'Server error',
        undefined,
        ErrorType.SERVER_ERROR
      )

      render(
        <ErrorBanner 
          error={error} 
          onDismiss={mockDismiss}
          showTroubleshooting={true}
        />
      )
      
      // Show troubleshooting tips
      const toggleButton = screen.getByText(/Show.*Troubleshooting Tips/i)
      fireEvent.click(toggleButton)
      
      // Fast-forward time by 5 seconds
      jest.advanceTimersByTime(5000)
      
      // Should not auto-dismiss
      expect(mockDismiss).not.toHaveBeenCalled()

      jest.useRealTimers()
    })
  })

  describe('Connection Status', () => {
    it('should display connected status with green indicator', () => {
      const error = new ApiError(0, 'Error', undefined, ErrorType.NETWORK_ERROR)

      render(
        <ErrorBanner 
          error={error} 
          connectionStatus={ConnectionStatus.CONNECTED}
        />
      )
      
      expect(screen.getByText('Connected')).toBeInTheDocument()
    })

    it('should display disconnected status with red indicator', () => {
      const error = new ApiError(0, 'Error', undefined, ErrorType.NETWORK_ERROR)

      render(
        <ErrorBanner 
          error={error} 
          connectionStatus={ConnectionStatus.DISCONNECTED}
        />
      )
      
      expect(screen.getByText('Disconnected')).toBeInTheDocument()
    })

    it('should display checking status', () => {
      const error = new ApiError(0, 'Error', undefined, ErrorType.NETWORK_ERROR)

      render(
        <ErrorBanner 
          error={error} 
          connectionStatus={ConnectionStatus.CHECKING}
        />
      )
      
      expect(screen.getByText('Checking...')).toBeInTheDocument()
    })
  })
})
