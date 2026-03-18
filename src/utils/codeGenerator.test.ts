import { describe, expect, it } from 'vitest'

import { generateOverrideCode } from './codeGenerator'

describe('generateOverrideCode', () => {
  it('generates a code of default length 16', () => {
    const code = generateOverrideCode()
    expect(code).toHaveLength(16)
  })

  it('generates a code of custom length', () => {
    const code = generateOverrideCode(8)
    expect(code).toHaveLength(8)
  })

  it('only contains allowed characters', () => {
    const allowed = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    const code = generateOverrideCode(100)
    for (const char of code) {
      expect(allowed).toContain(char)
    }
  })

  it('excludes ambiguous characters (0, O, 1, l, I)', () => {
    // Generate a long code to increase confidence
    const code = generateOverrideCode(1000)
    expect(code).not.toMatch(/[0O1lI]/)
  })

  it('generates unique codes', () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateOverrideCode()))
    expect(codes.size).toBe(50)
  })
})
