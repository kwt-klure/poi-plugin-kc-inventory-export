export type AtomicWriteFileSystem = {
  openSync: (path: string, flags: string, mode?: number) => number
  writeFileSync: (file: string | number, data: string) => void
  fsyncSync: (fileDescriptor: number) => void
  closeSync: (fileDescriptor: number) => void
  renameSync: (oldPath: string, newPath: string) => void
  unlinkSync: (path: string) => void
}

let temporaryFileSequence = 0

const buildTemporaryFilePath = (filePath: string) => {
  temporaryFileSequence += 1
  return `${filePath}.${Date.now()}-${temporaryFileSequence}.tmp`
}

export const writeFileAtomicSync = ({
  fs,
  filePath,
  contents,
}: {
  fs: AtomicWriteFileSystem
  filePath: string
  contents: string
}) => {
  const temporaryFilePath = buildTemporaryFilePath(filePath)
  let fileDescriptor: number | null = null

  try {
    fileDescriptor = fs.openSync(temporaryFilePath, 'w', 0o600)
    fs.writeFileSync(fileDescriptor, contents)
    fs.fsyncSync(fileDescriptor)
    fs.closeSync(fileDescriptor)
    fileDescriptor = null
    fs.renameSync(temporaryFilePath, filePath)
  } catch (error) {
    if (fileDescriptor != null) {
      try {
        fs.closeSync(fileDescriptor)
      } catch {
        // Preserve the original write error.
      }
    }
    try {
      fs.unlinkSync(temporaryFilePath)
    } catch {
      // The temporary file may not have been created yet.
    }
    throw error
  }
}
