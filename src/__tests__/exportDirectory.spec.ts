import { resolvePoiInventoryExportDirectory } from '../exportDirectory'

const joinPath = (...parts: string[]) => parts.join('/').replace(/\/+/g, '/')

describe('resolvePoiInventoryExportDirectory', () => {
  test('uses archive only when it resolves to the expected external archive', () => {
    const resolved = resolvePoiInventoryExportDirectory({
      documentsPath: '/Users/mira/Documents',
      existsSync: () => true,
      joinPath,
      realpathSync: (path) =>
        path === '/Users/mira/Documents/Mira-Workspace/archive'
          ? '/Volumes/Mira External/Mira-Workspace/archive'
          : path,
    })

    expect(resolved).toEqual({
      lane: 'archive',
      path: '/Users/mira/Documents/Mira-Workspace/archive/poi-inventory-exports',
    })
  })

  test('uses local fallback when the external archive is unavailable', () => {
    const resolved = resolvePoiInventoryExportDirectory({
      documentsPath: '/Users/mira/Documents',
      existsSync: (path) => !path.startsWith('/Volumes/'),
      joinPath,
      realpathSync: (path) => path,
    })

    expect(resolved).toEqual({
      lane: 'local-fallback',
      path: '/Users/mira/Documents/Mira-Workspace/local-fallback/poi-inventory-exports',
    })
  })
})
