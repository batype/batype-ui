'use client'
import type { ReactNode } from 'react'
import { App, ConfigProvider, type ConfigProviderProps } from 'antd'
import { getPopupContainer, usePopupContainer } from './components/PopupContainer.js'

export interface AntdCompatibilityProviderProps {
  children: ReactNode
  config?: Omit<ConfigProviderProps, 'children'>
}
/** Optional bridge: retain advanced Ant Design forms and keep popups in the modal top layer. */
export function AntdCompatibilityProvider({
  children,
  config = {},
}: AntdCompatibilityProviderProps) {
  const container = usePopupContainer()
  const popup = (trigger?: HTMLElement) =>
    container ?? config.getPopupContainer?.(trigger!) ?? getPopupContainer(trigger)
  const target = () => container ?? document.body
  return (
    <ConfigProvider
      {...config}
      getPopupContainer={popup}
      getTargetContainer={container ? target : config.getTargetContainer}
    >
      <App
        className="bui-antd-compat"
        message={{ getContainer: target }}
        notification={{ getContainer: target }}
      >
        {children}
      </App>
    </ConfigProvider>
  )
}

export {
  Form as AntdForm,
  DatePicker as AntdDatePicker,
  Select as AntdSelect,
  InputNumber as AntdInputNumber,
} from 'antd'
export const useAntdApp = App.useApp
