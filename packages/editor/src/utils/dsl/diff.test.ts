import { describe, expect, it } from 'vitest'
import { diffEdit } from './diff'

describe('diffEdit', () => {
  it('returns null when the strings are equal', () => {
    expect(diffEdit('abc', 'abc')).toBeNull()
  })

  it('handles a pure append', () => {
    expect(diffEdit('abc', 'abcd')).toEqual({ from: 3, to: 3, insert: 'd' })
  })

  it('handles a pure prepend', () => {
    expect(diffEdit('abc', 'xabc')).toEqual({ from: 0, to: 0, insert: 'x' })
  })

  it('handles a middle replacement', () => {
    expect(diffEdit('abXcd', 'abYcd')).toEqual({ from: 2, to: 3, insert: 'Y' })
  })

  it('handles a deletion', () => {
    expect(diffEdit('abcd', 'abd')).toEqual({ from: 2, to: 3, insert: '' })
  })

  it('produces an edit that, applied to oldText, yields newText', () => {
    const oldText = 'chart bar {\n  title = "A"\n}\n'
    const newText = 'chart bar {\n  title = "Hello"\n}\n'
    const edit = diffEdit(oldText, newText)!
    const applied = oldText.slice(0, edit.from) + edit.insert + oldText.slice(edit.to)
    expect(applied).toBe(newText)
  })
})
