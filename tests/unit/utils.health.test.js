import { describe, it, expect } from 'vitest'

// Import functions from utils.js (we'll need to export them first)
// For now, inline the implementations for testing

function calculateBMI(height, weight) {
  if (!height || !weight || height <= 0 || weight <= 0) return null
  const heightInMeters = height / 100
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1))
}

function getBMICategory(bmi) {
  if (!bmi) return null
  const bmiNum = parseFloat(bmi)
  if (bmiNum < 18.5) return { level: 'underweight', label: 'น้ำหนักต่ำกว่าเกณฑ์', color: 'blue' }
  if (bmiNum < 25) return { level: 'normal', label: 'น้ำหนักปกติ', color: 'green' }
  if (bmiNum < 30) return { level: 'overweight', label: 'น้ำหนักเกิน', color: 'yellow' }
  return { level: 'obese', label: 'อ้วน', color: 'red' }
}

function formatTime(hours, minutes) {
  const h = String(hours).padStart(2, '0')
  const m = String(minutes).padStart(2, '0')
  return `${h}:${m}`
}

function calculateSleepDuration(bedtime, wakeTime) {
  if (!bedtime || !wakeTime) return null
  const [bedH, bedM] = bedtime.split(':').map(Number)
  const [wakeH, wakeM] = wakeTime.split(':').map(Number)
  
  let bedMinutes = bedH * 60 + bedM
  let wakeMinutes = wakeH * 60 + wakeM
  
  if (wakeMinutes < bedMinutes) {
    wakeMinutes += 24 * 60 // Next day
  }
  
  const diffMinutes = wakeMinutes - bedMinutes
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  
  return { hours, minutes, totalMinutes: diffMinutes }
}

describe('Health Utility Functions', () => {
  describe('calculateBMI', () => {
    it('calculates BMI correctly for normal weight', () => {
      expect(calculateBMI(170, 65)).toBeCloseTo(22.5, 1)
    })
    
    it('returns null for invalid inputs', () => {
      expect(calculateBMI(0, 65)).toBeNull()
      expect(calculateBMI(170, 0)).toBeNull()
      expect(calculateBMI(null, 65)).toBeNull()
      expect(calculateBMI(170, -5)).toBeNull()
    })
    
    it('calculates BMI for underweight', () => {
      expect(calculateBMI(170, 50)).toBeCloseTo(17.3, 1)
    })
    
    it('calculates BMI for overweight', () => {
      expect(calculateBMI(170, 80)).toBeCloseTo(27.7, 1)
    })
  })
  
  describe('getBMICategory', () => {
    it('returns underweight for BMI < 18.5', () => {
      const result = getBMICategory(17)
      expect(result.level).toBe('underweight')
    })
    
    it('returns normal for BMI 18.5-24.9', () => {
      const result = getBMICategory(22)
      expect(result.level).toBe('normal')
    })
    
    it('returns overweight for BMI 25-29.9', () => {
      const result = getBMICategory(27)
      expect(result.level).toBe('overweight')
    })
    
    it('returns obese for BMI >= 30', () => {
      const result = getBMICategory(32)
      expect(result.level).toBe('obese')
    })
    
    it('returns null for invalid input', () => {
      expect(getBMICategory(null)).toBeNull()
    })
  })
  
  describe('formatTime', () => {
    it('formats time with leading zeros', () => {
      expect(formatTime(9, 5)).toBe('09:05')
    })
    
    it('formats time correctly for 2-digit values', () => {
      expect(formatTime(23, 59)).toBe('23:59')
    })
    
    it('formats midnight correctly', () => {
      expect(formatTime(0, 0)).toBe('00:00')
    })
  })
  
  describe('calculateSleepDuration', () => {
    it('calculates sleep within same day', () => {
      const result = calculateSleepDuration('22:00', '06:00')
      expect(result.hours).toBe(8)
      expect(result.minutes).toBe(0)
    })
    
    it('calculates sleep crossing midnight', () => {
      const result = calculateSleepDuration('23:30', '07:15')
      expect(result.hours).toBe(7)
      expect(result.minutes).toBe(45)
    })
    
    it('returns null for missing inputs', () => {
      expect(calculateSleepDuration(null, '06:00')).toBeNull()
      expect(calculateSleepDuration('22:00', null)).toBeNull()
    })
    
    it('handles short naps', () => {
      const result = calculateSleepDuration('14:00', '14:30')
      expect(result.hours).toBe(0)
      expect(result.minutes).toBe(30)
    })
  })
})
