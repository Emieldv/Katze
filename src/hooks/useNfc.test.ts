import { describe, expect, it } from 'vitest'

import { isNfcScanActive } from './useNfc'

describe('isNfcScanActive', () => {
  it('returns false when no scan is active', () => {
    expect(isNfcScanActive()).toBe(false)
  })
})
