import { exportInventoryBundleToDefaultDirectory } from './export'
import { IN_POI } from './poi/env'
import { getPoiStore } from './poi/store'
import type { PoiState, Store } from './poi/types'

export const AUTO_EXPORT_DEBOUNCE_MS = 800
export const AUTO_EXPORT_RETRY_MS = 1500

type RelevantStateRefs = {
  ships: unknown
  equips: unknown
  fleets: unknown
  decks: unknown
  shipMasters: unknown
  equipMasters: unknown
  shipTypes: unknown
}

const getRelevantStateRefs = (state: PoiState): RelevantStateRefs => ({
  ships: state.info?.ships,
  equips: state.info?.equips,
  fleets: state.info?.fleets,
  decks: state.info?.decks,
  shipMasters: state.const?.$ships,
  equipMasters: state.const?.$equips,
  shipTypes: state.const?.$shipTypes,
})

const didRelevantStateChange = (
  previousState: RelevantStateRefs | null,
  nextState: RelevantStateRefs,
) => {
  if (previousState == null) {
    return true
  }

  return (
    previousState.ships !== nextState.ships ||
    previousState.equips !== nextState.equips ||
    previousState.fleets !== nextState.fleets ||
    previousState.decks !== nextState.decks ||
    previousState.shipMasters !== nextState.shipMasters ||
    previousState.equipMasters !== nextState.equipMasters ||
    previousState.shipTypes !== nextState.shipTypes
  )
}

const hasExportableInventoryState = (state: PoiState) =>
  Boolean(
    state.info?.ships &&
      state.info?.equips &&
      state.const?.$ships &&
      state.const?.$equips,
  )

let watchedStore: Store<PoiState> | null = null
let unsubscribe: (() => void) | null = null
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let previousStateRefs: RelevantStateRefs | null = null
let exportInFlight = false
let exportQueued = false

const clearScheduledExport = () => {
  if (debounceTimer != null) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
}

const clearReconnect = () => {
  if (reconnectTimer != null) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

const runAutoExport = () => {
  if (watchedStore == null) {
    return
  }

  const state = watchedStore.getState()
  if (!hasExportableInventoryState(state)) {
    return
  }

  if (exportInFlight) {
    exportQueued = true
    return
  }

  exportInFlight = true
  try {
    const paths = exportInventoryBundleToDefaultDirectory(state)
    console.info(
      '[KC Inventory Export] Auto-exported inventory bundle to',
      paths.exportDirectory,
    )
  } catch (error) {
    console.warn('[KC Inventory Export] Background inventory export failed.', error)
  } finally {
    exportInFlight = false
    if (exportQueued) {
      exportQueued = false
      scheduleAutoExport()
    }
  }
}

const scheduleAutoExport = () => {
  clearScheduledExport()
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    runAutoExport()
  }, AUTO_EXPORT_DEBOUNCE_MS)
}

const scheduleReconnect = () => {
  clearReconnect()
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    void startAutoExportWatcher()
  }, AUTO_EXPORT_RETRY_MS)
}

export const stopAutoExportWatcher = () => {
  clearScheduledExport()
  clearReconnect()
  if (unsubscribe != null) {
    unsubscribe()
    unsubscribe = null
  }

  watchedStore = null
  previousStateRefs = null
  exportInFlight = false
  exportQueued = false
}

export const startAutoExportWatcher = async () => {
  if (!IN_POI) {
    return
  }

  stopAutoExportWatcher()

  watchedStore = await getPoiStore()
  if (watchedStore.__isFallbackStore) {
    watchedStore = null
    previousStateRefs = null
    scheduleReconnect()
    return
  }

  previousStateRefs = getRelevantStateRefs(watchedStore.getState())
  unsubscribe = watchedStore.subscribe(() => {
    if (watchedStore == null) {
      return
    }

    const nextStateRefs = getRelevantStateRefs(watchedStore.getState())
    if (!didRelevantStateChange(previousStateRefs, nextStateRefs)) {
      return
    }

    previousStateRefs = nextStateRefs
    scheduleAutoExport()
  })

  scheduleAutoExport()
}
