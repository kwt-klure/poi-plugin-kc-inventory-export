// See https://dev.poooi.app/docs/plugin-exports.html

import { startAutoExportWatcher, stopAutoExportWatcher } from './autoExport'

export const windowMode = false

export const pluginDidLoad = () => {
  void startAutoExportWatcher().catch((error) => {
    console.warn('[KC Inventory Export] Failed to start auto-export watcher.', error)
  })
}

export const pluginWillUnload = () => {
  stopAutoExportWatcher()
}

export { App as reactClass } from './App'
export { Settings as settingsClass } from './Settings'
