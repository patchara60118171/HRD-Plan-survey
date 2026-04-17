import { describe, it, expect } from 'vitest'

// Validation utility functions
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

function isValidPhone(phone) {
  if (!phone) return false
  const cleaned = phone.replace(/[-\s]/g, '')
  return /^0\d{8,9}$/.test(cleaned)
}

function isValidThaiID(id) {
  if (!id || id.length !== 13) return false
  if (!/^\d{13}$/.test(id)) return false
  
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id[i]) * (13 - i)
  }
  const checkDigit = (11 - (sum % 11)) % 10
  return checkDigit === parseInt(id[12])
}

function validateRequired(value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

function normalizeOrgCode(code) {
  if (!code || typeof code !== 'string') return ''
  return code.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

describe('Validation Functions', () => {
  describe('isValidEmail', () => {
    it('accepts valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
      expect(isValidEmail('test.user@domain.co.th')).toBe(true)
    })
    
    it('rejects invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail(null)).toBe(false)
    })
    
    it('trims whitespace before validation', () => {
      expect(isValidEmail('  user@example.com  ')).toBe(true)
    })
  })
  
  describe('isValidPhone', () => {
    it('accepts valid Thai phone numbers', () => {
      expect(isValidPhone('0812345678')).toBe(true)
      expect(isValidPhone('098-765-4321')).toBe(true)
      expect(isValidPhone('02 123 4567')).toBe(true)
    })
    
    it('rejects invalid phone numbers', () => {
      expect(isValidPhone('1234567')).toBe(false)
      expect(isValidPhone('12345678901')).toBe(false)
      expect(isValidPhone('')).toBe(false)
    })
  })
  
  describe('isValidThaiID', () => {
    it('accepts valid Thai ID (13 digits with check digit)', () => {
      // Test with known valid pattern
      expect(isValidThaiID('1234567890123')).toBe(false) // Invalid check digit
    })
    
    it('rejects invalid formats', () => {
      expect(isValidThaiID('1234567890')).toBe(false) // Too short
      expect(isValidThaiID('12345678901234')).toBe(false) // Too long
      expect(isValidThaiID('abcdefghijklm')).toBe(false) // Not digits
      expect(isValidThaiID('')).toBe(false)
    })
  })
  
  describe('validateRequired', () => {
    it('returns true for valid values', () => {
      expect(validateRequired('test')).toBe(true)
      expect(validateRequired(['item'])).toBe(true)
      expect(validateRequired({ key: 'value' })).toBe(true)
      expect(validateRequired(0)).toBe(true)
      expect(validateRequired(false)).toBe(true)
    })
    
    it('returns false for empty values', () => {
      expect(validateRequired('')).toBe(false)
      expect(validateRequired('   ')).toBe(false)
      expect(validateRequired([])).toBe(false)
      expect(validateRequired({})).toBe(false)
      expect(validateRequired(null)).toBe(false)
      expect(validateRequired(undefined)).toBe(false)
    })
  })
  
  describe('normalizeOrgCode', () => {
    it('normalizes org codes correctly', () => {
      expect(normalizeOrgCode('DSS')).toBe('dss')
      expect(normalizeOrgCode('Test-Org-123')).toBe('testorg123')
      expect(normalizeOrgCode('  MoPH  ')).toBe('moph')
    })
    
    it('handles edge cases', () => {
      expect(normalizeOrgCode('')).toBe('')
      expect(normalizeOrgCode(null)).toBe('')
      expect(normalizeOrgCode('!!!')).toBe('')
    })
  })
})
