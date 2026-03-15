import {
  Button,
  Callout,
  Divider,
  H4,
  OverlaysProvider,
  Text,
} from '@blueprintjs/core'
import { IconNames } from '@blueprintjs/icons'
import React, { StrictMode, useCallback, useState } from 'react'
import styled from 'styled-components'

import {
  buildEquipmentCsvFromPoiState,
  buildInventoryJsonFromPoiState,
  buildShipCsvFromPoiState,
  exportEquipmentCsvToFile,
  exportInventoryJsonToFile,
  exportShipCsvToFile,
} from './export'
import { IN_POI } from './poi/env'
import { usePluginTranslation } from './poi/hooks'
import { exportPoiState } from './poi/store'
import { usePoiTheme } from './poi/theme'
import {
  ActionsRow,
  BodyText,
  PageContent,
  PageRoot,
  SectionHeader,
  SurfaceCard,
} from './ui/chrome'

const StatusText = styled(Text)`
  white-space: pre-wrap;
`

type FailureTranslationKey =
  | 'Equipment CSV export failed'
  | 'Inventory JSON export failed'
  | 'Ship CSV export failed'
  | 'Inventory CSV export failed'

const AppMain: React.FC = () => {
  const { t } = usePluginTranslation()
  const { isDark, rootRef } = usePoiTheme<HTMLDivElement>()
  const [isExporting, setIsExporting] = useState(false)
  const [status, setStatus] = useState<{
    intent: 'success' | 'warning' | 'danger' | null
    message: string
  }>({
    intent: null,
    message: '',
  })

  const setFailureStatus = useCallback(
    (translationKey: FailureTranslationKey, error: unknown) => {
      setStatus({
        intent: 'danger',
        message:
          error instanceof Error
            ? `${t(translationKey)}\n${error.message}`
            : t(translationKey),
      })
    },
    [t],
  )

  const handleEquipmentExport = useCallback(async () => {
    setIsExporting(true)
    try {
      const poiState = await exportPoiState()
      const csv = buildEquipmentCsvFromPoiState(poiState)
      const saved = await exportEquipmentCsvToFile(csv)

      if (!saved) {
        setStatus({
          intent: 'warning',
          message: t('Equipment CSV export canceled'),
        })
        return
      }

      setStatus({
        intent: 'success',
        message: t('Equipment CSV export success'),
      })
    } catch (error) {
      console.error(error)
      setFailureStatus('Equipment CSV export failed', error)
    } finally {
      setIsExporting(false)
    }
  }, [setFailureStatus, t])

  const handleShipExport = useCallback(async () => {
    setIsExporting(true)
    try {
      const poiState = await exportPoiState()
      const csv = buildShipCsvFromPoiState(poiState)
      const saved = await exportShipCsvToFile(csv)

      if (!saved) {
        setStatus({
          intent: 'warning',
          message: t('Ship CSV export canceled'),
        })
        return
      }

      setStatus({
        intent: 'success',
        message: t('Ship CSV export success'),
      })
    } catch (error) {
      console.error(error)
      setFailureStatus('Ship CSV export failed', error)
    } finally {
      setIsExporting(false)
    }
  }, [setFailureStatus, t])

  const handleInventoryJsonExport = useCallback(async () => {
    setIsExporting(true)
    try {
      const poiState = await exportPoiState()
      const json = buildInventoryJsonFromPoiState(poiState)
      const saved = await exportInventoryJsonToFile(json)

      if (!saved) {
        setStatus({
          intent: 'warning',
          message: t('Inventory JSON export canceled'),
        })
        return
      }

      setStatus({
        intent: 'success',
        message: t('Inventory JSON export success'),
      })
    } catch (error) {
      console.error(error)
      setFailureStatus('Inventory JSON export failed', error)
    } finally {
      setIsExporting(false)
    }
  }, [setFailureStatus, t])

  const handleInventoryExport = useCallback(async () => {
    setIsExporting(true)
    try {
      const poiState = await exportPoiState()
      const shipCsv = buildShipCsvFromPoiState(poiState)
      const equipmentCsv = buildEquipmentCsvFromPoiState(poiState)

      const shipSaved = await exportShipCsvToFile(shipCsv)
      if (!shipSaved) {
        setStatus({
          intent: 'warning',
          message: t('Inventory CSV export canceled'),
        })
        return
      }

      const equipmentSaved = await exportEquipmentCsvToFile(equipmentCsv)
      if (!equipmentSaved) {
        setStatus({
          intent: 'warning',
          message: t('Ship CSV exported, equipment CSV export canceled'),
        })
        return
      }

      setStatus({
        intent: 'success',
        message: t('Inventory CSV export success'),
      })
    } catch (error) {
      console.error(error)
      setFailureStatus('Inventory CSV export failed', error)
    } finally {
      setIsExporting(false)
    }
  }, [setFailureStatus, t])

  return (
    <PageRoot ref={rootRef}>
      <PageContent>
        <SurfaceCard $isDark={isDark} elevation={0}>
          <SectionHeader>
          <H4>{t('KC Inventory Export')}</H4>
            <BodyText>{t('Inventory export description')}</BodyText>
          </SectionHeader>

          <Callout
            intent={IN_POI ? 'primary' : 'warning'}
            icon={IconNames.INFO_SIGN}
          >
            {IN_POI
              ? t('Inventory export ready hint')
              : t('Poi environment required')}
          </Callout>

          <Divider />

          <ActionsRow>
            <Button
              large
              intent="primary"
              icon={IconNames.EXPORT}
              text={t('Export ship and equipment CSVs')}
              loading={isExporting}
              disabled={!IN_POI || isExporting}
              onClick={handleInventoryExport}
            />
            <Button
              large
              icon={IconNames.SHIP}
              text={t('Export ship CSV')}
              loading={isExporting}
              disabled={!IN_POI || isExporting}
              onClick={handleShipExport}
            />
            <Button
              large
              icon={IconNames.CODE_BLOCK}
              text={t('Export inventory JSON')}
              loading={isExporting}
              disabled={!IN_POI || isExporting}
              onClick={handleInventoryJsonExport}
            />
            <Button
              large
              icon={IconNames.BOX}
              text={t('Export equipment CSV')}
              loading={isExporting}
              disabled={!IN_POI || isExporting}
              onClick={handleEquipmentExport}
            />
          </ActionsRow>

          {status.message ? (
            <>
              <Divider />
              <Callout
                intent={status.intent ?? 'none'}
                icon={
                  status.intent === 'success'
                    ? IconNames.TICK
                    : status.intent === 'warning'
                      ? IconNames.WARNING_SIGN
                      : IconNames.ERROR
                }
              >
                <StatusText>{status.message}</StatusText>
              </Callout>
            </>
          ) : null}
        </SurfaceCard>
      </PageContent>
    </PageRoot>
  )
}

export const App = () => (
  <StrictMode>
    <OverlaysProvider>
      <AppMain />
    </OverlaysProvider>
  </StrictMode>
)
