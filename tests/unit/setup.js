/**
 * Test Setup for Vitest
 * 
 * This file runs before all tests.
 * Sets up mocks for browser APIs and Supabase.
 */

import { vi } from 'vitest'

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// Mock sessionStorage
global.sessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// Mock window.location
delete window.location
window.location = {
  href: 'http://localhost:3000',
  search: '',
  pathname: '/',
  hash: ''
}

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
}
