import { useWait } from './useWait'

describe('useWait', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('start/end toggle waiting(id)', () => {
    const { start, end, waiting } = useWait()
    expect(waiting('load')).toBe(false)
    start('load')
    expect(waiting('load')).toBe(true)
    end('load')
    expect(waiting('load')).toBe(false)
  })

  it('waitFor(id, fn) is active during the call and clears after', async () => {
    const { waitFor, waiting } = useWait()
    let activeDuringRun = false
    const run = waitFor('task', async () => {
      activeDuringRun = waiting('task')
    })
    const promise = run()
    expect(waiting('task')).toBe(true)
    await promise
    expect(activeDuringRun).toBe(true)
    expect(waiting('task')).toBe(false)
  })

  it('waitFor clears the loader even when the task rejects', async () => {
    const { waitFor, waiting } = useWait()
    const run = waitFor('boom', async () => {
      throw new Error('nope')
    })
    await expect(run()).rejects.toThrow('nope')
    expect(waiting('boom')).toBe(false)
  })

  it('throws when given no function to run', () => {
    const { waitFor } = useWait()
    expect(() => waitFor('id')).toThrow()
  })
})
