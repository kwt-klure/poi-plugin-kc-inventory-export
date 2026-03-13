import { Callout, H5, Text } from '@blueprintjs/core'
import React, { StrictMode } from 'react'
import styled from 'styled-components'

import PKG from '../package.json'
import { usePluginTranslation } from './poi/hooks'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  user-select: text;
`

export const SettingsMain = () => {
  const { t } = usePluginTranslation()

  return (
    <Container>
      <H5>{t('KC Inventory Export')}</H5>
      <Text>{t('Inventory export settings description')}</Text>
      <Callout intent="primary">{t('Inventory export settings hint')}</Callout>
      <Text>{t('Version', { version: PKG.version })}</Text>
    </Container>
  )
}

export const Settings = () => (
  <StrictMode>
    <SettingsMain />
  </StrictMode>
)
