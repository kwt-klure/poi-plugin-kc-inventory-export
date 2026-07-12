jest.mock('../export', () => ({
  exportInventoryBundleToDefaultDirectory: jest.fn(),
}))

jest.mock('../poi/env', () => ({
  IN_POI: true,
}))

jest.mock('../poi/store', () => ({
  getPoiStore: jest.fn(),
}))

import { exportInventoryBundleToDefaultDirectory } from '../export'
import { getPoiStore } from '../poi/store'
import { startAutoExportWatcher, stopAutoExportWatcher } from '../autoExport'
import type { PoiState, Store } from '../poi/types'

const basePoiState: PoiState = {
  ui: { activeMainTab: '' },
  plugins: [],
  info: {
    ships: {
      '1': {
        api_id: 1,
        api_ship_id: 101,
        api_lv: 1,
        api_cond: 49,
        api_soku: 10,
        api_slot: [],
      },
    },
    equips: {},
    decks: [],
  },
  const: {
    $ships: {
      '101': {
        api_name: '島風',
      },
    },
    $equips: {},
    $shipTypes: {},
  },
}

class MockStore implements Store<PoiState> {
  private listeners = new Set<() => void>()

  constructor(private state: PoiState) {}

  getState = () => this.state

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  setState = (state: PoiState) => {
    this.state = state
    this.listeners.forEach((listener) => listener())
  }
}

describe('auto export watcher', () => {
  const originalPoiVersion = (globalThis as { POI_VERSION?: string }).POI_VERSION
  const mockedGetPoiStore = getPoiStore as jest.MockedFunction<typeof getPoiStore>
  const mockedExportInventoryBundle =
    exportInventoryBundleToDefaultDirectory as jest.MockedFunction<
      typeof exportInventoryBundleToDefaultDirectory
    >

  beforeEach(() => {
    jest.useFakeTimers()
    ;(globalThis as { POI_VERSION?: string }).POI_VERSION = 'test'
    mockedExportInventoryBundle.mockReturnValue({
      exportDirectory: '/tmp/poi-inventory-exports',
      shipCsvPath: '/tmp/poi-inventory-exports/kancolle_kan_26-03-12.csv',
      equipmentCsvPath:
        '/tmp/poi-inventory-exports/kancolle_equips_2026-03-12.csv',
      inventoryJsonPath:
        '/tmp/poi-inventory-exports/kancolle_inventory_2026-03-12.json',
    })
  })

  afterEach(() => {
    stopAutoExportWatcher()
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    mockedGetPoiStore.mockReset()
    mockedExportInventoryBundle.mockReset()

    if (originalPoiVersion == null) {
      delete (globalThis as { POI_VERSION?: string }).POI_VERSION
    } else {
      ;(globalThis as { POI_VERSION?: string }).POI_VERSION = originalPoiVersion
    }
  })

  test('exports once on load and ignores unrelated UI-only state changes', async () => {
    const store = new MockStore(basePoiState)
    mockedGetPoiStore.mockResolvedValue(store)

    await startAutoExportWatcher()
    jest.runOnlyPendingTimers()

    expect(mockedExportInventoryBundle).toHaveBeenCalledTimes(1)

    store.setState({
      ...basePoiState,
      ui: {
        activeMainTab: 'plugin',
      },
    })
    jest.runOnlyPendingTimers()

    expect(mockedExportInventoryBundle).toHaveBeenCalledTimes(1)
  })

  test('exports again when watched inventory references change', async () => {
    const store = new MockStore(basePoiState)
    mockedGetPoiStore.mockResolvedValue(store)

    await startAutoExportWatcher()
    jest.runOnlyPendingTimers()

    store.setState({
      ...basePoiState,
      info: {
        ...basePoiState.info,
        ships: {
          ...(basePoiState.info?.ships ?? {}),
        },
      },
    })
    jest.runOnlyPendingTimers()

    expect(mockedExportInventoryBundle).toHaveBeenCalledTimes(2)
  })
})
