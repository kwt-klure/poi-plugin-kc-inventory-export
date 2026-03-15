import { Callout, Divider, H5 } from '@blueprintjs/core'
import React, { StrictMode } from 'react'

import PKG from '../package.json'
import { usePluginTranslation } from './poi/hooks'
import { usePoiTheme } from './poi/theme'
import {
  BodyText,
  MetaText,
  PageContent,
  PageRoot,
  SectionHeader,
  SurfaceCard,
} from './ui/chrome'

export const SettingsMain = () => {
  const { t } = usePluginTranslation()
  const { isDark, rootRef } = usePoiTheme<HTMLDivElement>()

  return (
    <PageRoot ref={rootRef}>
      <PageContent>
        <SurfaceCard $isDark={isDark} elevation={0}>
          <SectionHeader>
            <H5>{t('KC Inventory Export')}</H5>
            <BodyText>{t('Inventory export settings description')}</BodyText>
          </SectionHeader>
          <Callout intent="primary">
            {t('Inventory export settings hint')}
          </Callout>
          <Divider />
          <MetaText $isDark={isDark}>
            {t('Version', { version: PKG.version })}
          </MetaText>
        </SurfaceCard>
      </PageContent>
    </PageRoot>
  )
}

export const Settings = () => (
  <StrictMode>
    <SettingsMain />
  </StrictMode>
)
