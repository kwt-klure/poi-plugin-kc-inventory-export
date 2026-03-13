import { importFromPoi, IN_POI } from './env'
import type { PoiState, Store } from './types'

const createFallbackState = (state?: PoiState): PoiState => ({
  ui: {
    activeMainTab: '',
    ...state?.ui,
  },
  plugins: state?.plugins ?? [],
  ...state,
})

const genFallbackStore = (state?: PoiState): Store<PoiState> => ({
  getState: () => createFallbackState(state),
  subscribe: () => () => {},
})

let globalStore: Store<PoiState> | null = null
/**
 * Get poi global Store if in poi env
 */
export const getPoiStore: () => Promise<Store<PoiState>> = async () => {
  if (globalStore !== null) {
    return globalStore
  }
  if (IN_POI) {
    try {
      const { store } = await importFromPoi('views/create-store')
      globalStore = store
      return store
    } catch (error) {
      console.warn('Load global store error', error)
    }
  }
  globalStore = genFallbackStore()
  return globalStore
}

export const exportPoiState = async () => {
  if (!IN_POI) {
    throw new Error(
      'Failed export state from poi! You are not currently in the poi environment!',
    )
  }
  const { getState } = await getPoiStore()
  return getState()
}

/**
 * Used by tests or local previews to inject a stable fallback poi state.
 */
export const importPoiState = (state: PoiState) => {
  globalStore = genFallbackStore(state)
}
