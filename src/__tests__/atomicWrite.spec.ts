import { writeFileAtomicSync } from '../atomicWrite'

describe('writeFileAtomicSync', () => {
  test('flushes and renames a temporary file over the final path', () => {
    const calls: string[] = []
    const fs = {
      openSync: (path: string) => {
        calls.push(`open:${path}`)
        return 42
      },
      writeFileSync: (file: string | number, data: string) =>
        calls.push(`write:${file}:${data}`),
      fsyncSync: (fileDescriptor: number) =>
        calls.push(`fsync:${fileDescriptor}`),
      closeSync: (fileDescriptor: number) =>
        calls.push(`close:${fileDescriptor}`),
      renameSync: (oldPath: string, newPath: string) =>
        calls.push(`rename:${oldPath}:${newPath}`),
      unlinkSync: (path: string) => calls.push(`unlink:${path}`),
    }

    writeFileAtomicSync({
      fs,
      filePath: '/tmp/snapshot.json',
      contents: '{"ok":true}',
    })

    expect(calls[0]).toMatch(/^open:\/tmp\/snapshot\.json\..+\.tmp$/)
    expect(calls.slice(1, 4)).toEqual([
      'write:42:{"ok":true}',
      'fsync:42',
      'close:42',
    ])
    expect(calls[4]).toMatch(
      /^rename:\/tmp\/snapshot\.json\..+\.tmp:\/tmp\/snapshot\.json$/,
    )
    expect(calls).toHaveLength(5)
  })

  test('cleans up the temporary file after a failed write', () => {
    const closeSync = jest.fn()
    const unlinkSync = jest.fn()
    const fs = {
      openSync: jest.fn(() => 7),
      writeFileSync: jest.fn(() => {
        throw new Error('disk full')
      }),
      fsyncSync: jest.fn(),
      closeSync,
      renameSync: jest.fn(),
      unlinkSync,
    }

    expect(() =>
      writeFileAtomicSync({
        fs,
        filePath: '/tmp/snapshot.json',
        contents: '{}',
      }),
    ).toThrow('disk full')
    expect(closeSync).toHaveBeenCalledWith(7)
    expect(unlinkSync).toHaveBeenCalledWith(
      expect.stringMatching(/^\/tmp\/snapshot\.json\..+\.tmp$/),
    )
  })
})
