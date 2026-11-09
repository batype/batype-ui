import { createContext, useContext } from 'react'

/** Popups must remain inside a native modal's top layer. */
export const PopupContainerContext = createContext<HTMLElement | undefined>(undefined)
export const usePopupContainer = () => useContext(PopupContainerContext)

export function getPopupContainer(trigger?: HTMLElement): HTMLElement {
  const modal = trigger?.closest<HTMLDialogElement>('dialog[open]')
  if (modal) return modal
  if (typeof document === 'undefined')
    throw new Error('getPopupContainer is only available in a browser.')
  return document.body
}
