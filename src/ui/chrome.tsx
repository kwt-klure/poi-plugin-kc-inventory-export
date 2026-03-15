import { Card, Text } from '@blueprintjs/core'
import styled from 'styled-components'

type ThemeAwareProps = {
  $isDark: boolean
}

export const PageRoot = styled.div`
  display: flex;
  flex: 1;
  min-height: 100%;
  padding: 16px;
  overflow: auto;
  user-select: text;
`

export const PageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(720px, 100%);
  margin: 0 auto;
`

export const SurfaceCard = styled(Card)<ThemeAwareProps>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  box-shadow: none;
  border: 1px solid
    ${({ $isDark }) =>
      $isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(17, 20, 24, 0.12)'};
`

export const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const BodyText = styled(Text)`
  line-height: 1.5;
`

export const ActionsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: stretch;

  & > * {
    flex: 1 1 220px;
    justify-content: flex-start;
  }
`

export const MetaText = styled(Text)<ThemeAwareProps>`
  color: ${({ $isDark }) =>
    $isDark ? 'rgba(255, 255, 255, 0.72)' : 'rgba(17, 20, 24, 0.65)'};
`
