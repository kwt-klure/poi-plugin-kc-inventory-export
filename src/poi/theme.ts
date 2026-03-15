import { Classes } from '@blueprintjs/core'
import {
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

export type PoiThemeMode = 'light' | 'dark'

const getParentElement = (element: Element | Text | null | undefined) =>
  element instanceof Element ? element.parentElement : element?.parentElement

export const hasDarkBlueprintAncestor = (
  element: Element | Text | null | undefined,
) => {
  const parentElement = getParentElement(element)
  return parentElement?.closest(`.${Classes.DARK}`) != null
}

const getObservedThemeTargets = (element: HTMLElement) => {
  const targets: Element[] = []
  const seen = new Set<Element>()
  const ownerDocument = element.ownerDocument

  const registerTarget = (target: Element | null | undefined) => {
    if (!target || seen.has(target)) {
      return
    }

    seen.add(target)
    targets.push(target)
  }

  registerTarget(ownerDocument.documentElement)
  registerTarget(ownerDocument.body)

  let current = element.parentElement
  while (current) {
    registerTarget(current)
    current = current.parentElement
  }

  return targets
}

export const usePoiTheme = <T extends HTMLElement = HTMLDivElement>() => {
  const rootRef = useRef<T>(null)
  const [isDark, setIsDark] = useState(false)

  useLayoutEffect(() => {
    const element = rootRef.current
    if (!element) {
      return
    }

    const updateTheme = () => {
      setIsDark(hasDarkBlueprintAncestor(element))
    }

    updateTheme()

    if (typeof MutationObserver === 'undefined') {
      return
    }

    const observer = new MutationObserver(() => {
      updateTheme()
    })

    getObservedThemeTargets(element).forEach((target) => {
      observer.observe(target, {
        attributes: true,
        attributeFilter: ['class'],
      })
    })

    return () => observer.disconnect()
  }, [])

  return {
    isDark,
    mode: isDark ? 'dark' : 'light',
    rootRef,
  }
}
