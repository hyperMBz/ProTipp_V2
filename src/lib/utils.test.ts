import { describe, it, expect } from 'vitest'
import { addNumbers } from './utils'

describe('addNumbers', () => {
  it('összead két számot helyesen', () => {
    expect(addNumbers(2, 3)).toBe(5)
    expect(addNumbers(-1, 1)).toBe(0)
  })
})
