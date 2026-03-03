import { describe, it, expect } from 'vitest'
import { transformValue } from './transformValue'

describe('transformValue', () => {
  describe('type conversions', () => {
    it('to-number handles empty string', () => {
      expect(transformValue('', 'to-number', {})).toBe('0')
    })

    it('to-number handles whitespace-only string', () => {
      expect(transformValue('   ', 'to-number', {})).toBe('0')
    })

    it('to-number handles scientific notation', () => {
      expect(transformValue('1.5e3', 'to-number', {})).toBe('1500')
    })

    it('to-number handles negative values', () => {
      expect(transformValue('-42.5', 'to-number', {})).toBe('-42.5')
    })

    it('to-date with invalid date returns original', () => {
      expect(transformValue('not-a-date', 'to-date', {})).toBe('not-a-date')
    })

    it('to-boolean with mixed case', () => {
      expect(transformValue('YES', 'to-boolean', {})).toBe('true')
      expect(transformValue('No', 'to-boolean', {})).toBe('false')
      expect(transformValue('ON', 'to-boolean', {})).toBe('true')
      expect(transformValue('Off', 'to-boolean', {})).toBe('false')
    })

    it('to-boolean with unknown value returns unchanged', () => {
      expect(transformValue('maybe', 'to-boolean', {})).toBe('maybe')
    })

    it('to-boolean with empty string returns false', () => {
      expect(transformValue('', 'to-boolean', {})).toBe('false')
    })

    it('parse-json with missing key returns empty string', () => {
      expect(transformValue('{"a":1}', 'parse-json', { key: 'missing' })).toBe('')
    })

    it('parse-json with nested object stringifies', () => {
      const result = transformValue('{"a":{"b":1}}', 'parse-json', {})
      expect(JSON.parse(result)).toEqual({ a: { b: 1 } })
    })

    it('unknown type conversion returns value unchanged', () => {
      expect(transformValue('hello', 'to-unknown', {})).toBe('hello')
    })
  })

  describe('string operations', () => {
    it('trim handles empty string', () => {
      expect(transformValue('', 'trim', {})).toBe('')
    })

    it('slugify handles special characters', () => {
      expect(transformValue('Hello, World! (2024)', 'slugify', {})).toBe('hello-world-2024')
    })

    it('slugify handles leading/trailing hyphens', () => {
      expect(transformValue('--hello--', 'slugify', {})).toBe('hello')
    })

    it('regex-replace with invalid regex returns value unchanged', () => {
      expect(transformValue('hello', 'regex-replace', { pattern: '[invalid' })).toBe('hello')
    })

    it('regex-replace with global flag replaces all', () => {
      expect(transformValue('aaa', 'regex-replace', { pattern: 'a', replacement: 'b' })).toBe('bbb')
    })

    it('extract with no params returns full string', () => {
      expect(transformValue('hello', 'extract', {})).toBe('hello')
    })

    it('extract with start beyond length returns empty', () => {
      expect(transformValue('hi', 'extract', { start: '10' })).toBe('')
    })

    it('pad-start with zero length returns unchanged', () => {
      expect(transformValue('hello', 'pad-start', { length: '0' })).toBe('hello')
    })

    it('pad-end with default space char', () => {
      expect(transformValue('hi', 'pad-end', { length: '5' })).toBe('hi   ')
    })

    it('remove-diacritics with no diacritics returns unchanged', () => {
      expect(transformValue('hello', 'remove-diacritics', {})).toBe('hello')
    })

    it('title-case with single word', () => {
      expect(transformValue('hello', 'title-case', {})).toBe('Hello')
    })

    it('unknown string operation returns value unchanged', () => {
      expect(transformValue('hello', 'unknown-op', {})).toBe('hello')
    })
  })

  describe('numeric operations', () => {
    it('round with NaN input returns original', () => {
      expect(transformValue('abc', 'round', { decimals: '2' })).toBe('abc')
    })

    it('floor with NaN input returns original', () => {
      expect(transformValue('abc', 'floor', {})).toBe('abc')
    })

    it('ceil with NaN input returns original', () => {
      expect(transformValue('abc', 'ceil', {})).toBe('abc')
    })

    it('abs with NaN input returns original', () => {
      expect(transformValue('abc', 'abs', {})).toBe('abc')
    })

    it('clamp with only min', () => {
      expect(transformValue('5', 'clamp', { min: '10' })).toBe('10')
      expect(transformValue('15', 'clamp', { min: '10' })).toBe('15')
    })

    it('clamp with only max', () => {
      expect(transformValue('50', 'clamp', { max: '10' })).toBe('10')
      expect(transformValue('5', 'clamp', { max: '10' })).toBe('5')
    })

    it('log of 1 returns 0', () => {
      expect(transformValue('1', 'log', {})).toBe('0')
    })

    it('log of negative returns original', () => {
      expect(transformValue('-5', 'log', {})).toBe('-5')
    })

    it('exp of 0 returns 1', () => {
      expect(transformValue('0', 'exp', {})).toBe('1')
    })

    it('bin with default size 1', () => {
      expect(transformValue('3.7', 'bin', {})).toBe('3')
    })

    it('bin with size 0 defaults to 1', () => {
      expect(transformValue('3.7', 'bin', { size: '0' })).toBe('3')
    })
  })

  describe('date operations', () => {
    it('extract-year with invalid date returns original', () => {
      expect(transformValue('not-a-date', 'extract-year', {})).toBe('not-a-date')
    })

    it('extract-month with invalid date returns original', () => {
      expect(transformValue('not-a-date', 'extract-month', {})).toBe('not-a-date')
    })

    it('shift-date with zero amount returns same date', () => {
      const result = transformValue('2024-03-15T00:00:00.000Z', 'shift-date', { amount: '0', unit: 'days' })
      expect(result).toContain('2024-03-15')
    })

    it('shift-date with negative amount goes backward', () => {
      const result = transformValue('2024-03-15T00:00:00.000Z', 'shift-date', { amount: '-10', unit: 'days' })
      expect(result).toContain('2024-03-05')
    })

    it('truncate-date with unknown period returns ISO string', () => {
      const result = transformValue('2024-03-15T12:00:00.000Z', 'truncate-date', { period: 'unknown' })
      expect(result).toContain('2024-03-15')
    })

    it('date-diff with invalid reference returns original', () => {
      expect(transformValue('2024-03-15', 'date-diff', { reference: 'not-a-date' })).toBe('2024-03-15')
    })

    it('date-diff with invalid value returns original', () => {
      expect(transformValue('not-a-date', 'date-diff', { reference: '2024-03-01' })).toBe('not-a-date')
    })
  })

  describe('dispatch routing', () => {
    it('routes to-* operations to type conversion', () => {
      expect(transformValue('42', 'to-string', {})).toBe('42')
    })

    it('routes parse-json to type conversion', () => {
      expect(transformValue('{"a":1}', 'parse-json', {})).toBe('{"a":1}')
    })

    it('routes numeric ops correctly', () => {
      expect(transformValue('3.7', 'floor', {})).toBe('3')
    })

    it('routes extract-* to date ops', () => {
      expect(transformValue('2024-03-15', 'extract-year', {})).toBe('2024')
    })

    it('routes shift-* to date ops', () => {
      const r = transformValue('2024-03-15T00:00:00.000Z', 'shift-date', { amount: '1', unit: 'days' })
      expect(r).toContain('2024-03-16')
    })

    it('routes truncate-* to date ops', () => {
      const r = transformValue('2024-03-15T00:00:00.000Z', 'truncate-date', { period: 'year' })
      expect(r).toContain('2024-01-01')
    })

    it('routes date-diff to date ops', () => {
      const r = transformValue('2024-03-15', 'date-diff', { reference: '2024-03-01' })
      expect(r).toBe('14')
    })

    it('defaults unknown operations to string handler', () => {
      expect(transformValue('hello', 'totally-unknown', {})).toBe('hello')
    })
  })
})
