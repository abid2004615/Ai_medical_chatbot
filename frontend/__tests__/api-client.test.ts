/**
 * Integration tests for API Client error handling
 * 
 * These tests verify:
 * - Error classification for different failure types
 * - Retry mechanism with mock failures
 * - Health check functionality
 */

import { apiClient, ApiError, ErrorType } from '@/lib/api-client'

// Mock fetch globally
global.fetch = jest.fn()

describe('API Client Error Handling', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  describe('Error Classification', () => {
    it('should classify network errors as BACKEND_NOT_RUNNING', async () => {
      // Mock fetch to throw TypeError (network error)
      ;(global.fetch as jest.Mock).mockRejectedValue(
        new TypeError('Failed to fetch')
      )

      try {
        await apiClient.sendMessage({
          message: 'test',
          sessionId: 'test-session'
        })
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        const apiError = error as ApiError
        expect(apiError.type).toBe(ErrorType.BACKEND_NOT_RUNNING)
        expect(apiError.userMessage).toContain('Backend server is not running')
      }
    })

    it('should classify 500 errors as SERVER_ERROR', async () => {
      // Mock fetch to return 500 error
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      })

      try {
        await apiClient.sendMessage({
          message: 'test',
          sessionId: 'test-session'
        })
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        const apiError = error as ApiError
        expect(apiError.type).toBe(ErrorType.SERVER_ERROR)
        expect(apiError.userMessage).toContain('server encountered an error')
        expect(apiError.retryable).toBe(true)
      }
    })

    it('should classify timeout errors as TIMEOUT', async () => {
      // Mock fetch to throw timeout error
      ;(global.fetch as jest.Mock).mockRejectedValue(
        new Error('Request timeout')
      )

      try {
        await apiClient.sendMessage({
          message: 'test',
          sessionId: 'test-session'
        })
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        const apiError = error as ApiError
        expect(apiError.type).toBe(ErrorType.TIMEOUT)
        expect(apiError.userMessage).toContain('timed out')
      }
    })
  })

  describe('Retry Mechanism', () => {
    it('should retry on server errors up to 3 times', async () => {
      let attemptCount = 0
      
      ;(global.fetch as jest.Mock).mockImplementation(() => {
        attemptCount++
        return Promise.resolve({
          ok: false,
          status: 500,
          text: async () => 'Server Error'
        })
      })

      try {
        await apiClient.sendMessage({
          message: 'test',
          sessionId: 'test-session'
        })
        fail('Should have thrown an error')
      } catch (error) {
        // Should have attempted 3 times
        expect(attemptCount).toBe(3)
      }
    })

    it('should succeed after retry', async () => {
      let attemptCount = 0
      
      ;(global.fetch as jest.Mock).mockImplementation(() => {
        attemptCount++
        if (attemptCount < 2) {
          return Promise.resolve({
            ok: false,
            status: 500,
            text: async () => 'Server Error'
          })
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            response: 'Success',
            input_type: ['text']
          })
        })
      })

      const result = await apiClient.sendMessage({
        message: 'test',
        sessionId: 'test-session'
      })

      expect(result.response).toBe('Success')
      expect(attemptCount).toBe(2)
    })
  })

  describe('Health Check', () => {
    it('should return ok status when backend is healthy', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          status: 'ok',
          message: 'MediChat backend is running',
          timestamp: Date.now(),
          version: '1.0.0'
        })
      })

      const health = await apiClient.checkHealth()
      
      expect(health.status).toBe('ok')
      expect(health.message).toContain('running')
    })

    it('should return error status when backend is down', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(
        new TypeError('Failed to fetch')
      )

      const health = await apiClient.checkHealth()
      
      expect(health.status).toBe('error')
    })

    it('should correctly report backend availability', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          status: 'ok',
          message: 'Backend running',
          timestamp: Date.now()
        })
      })

      const isAvailable = await apiClient.isBackendAvailable()
      
      expect(isAvailable).toBe(true)
    })
  })

  describe('Error Properties', () => {
    it('should set retryable to true for server errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Server Error'
      })

      try {
        await apiClient.sendMessage({
          message: 'test',
          sessionId: 'test-session'
        })
      } catch (error) {
        const apiError = error as ApiError
        expect(apiError.retryable).toBe(true)
      }
    })

    it('should set retryable to false for backend not running', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(
        new TypeError('Failed to fetch')
      )

      try {
        await apiClient.sendMessage({
          message: 'test',
          sessionId: 'test-session'
        })
      } catch (error) {
        const apiError = error as ApiError
        expect(apiError.retryable).toBe(false)
      }
    })

    it('should include both user and technical messages', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Detailed technical error'
      })

      try {
        await apiClient.sendMessage({
          message: 'test',
          sessionId: 'test-session'
        })
      } catch (error) {
        const apiError = error as ApiError
        expect(apiError.userMessage).toBeTruthy()
        expect(apiError.technicalMessage).toBeTruthy()
        expect(apiError.userMessage).not.toBe(apiError.technicalMessage)
      }
    })
  })
})
