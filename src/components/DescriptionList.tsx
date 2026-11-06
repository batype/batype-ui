import type { ReactNode } from 'react'
export interface DetailField<T> {
  key: keyof T
  label: ReactNode
  render?: (value: T[keyof T], row: T) => ReactNode
  hideEmpty?: boolean
}
export interface DescriptionListProps<T> {
  data: T
  fields: readonly DetailField<T>[]
  hideEmpty?: boolean
  emptyValue?: ReactNode
}
export function DescriptionList<T>({
  data,
  fields,
  hideEmpty = true,
  emptyValue = '—',
}: DescriptionListProps<T>) {
  return (
    <dl className="bui-descriptions">
      {fields.map((field) => {
        const value = data[field.key],
          empty = value == null || (typeof value === 'string' && value.trim() === '')
        if ((field.hideEmpty ?? hideEmpty) && empty) return null
        const rendered = field.render
          ? field.render(value, data)
          : empty
            ? emptyValue
            : typeof value === 'boolean'
              ? String(value)
              : typeof value === 'string' || typeof value === 'number'
                ? value
                : emptyValue
        return (
          <div key={String(field.key)}>
            <dt>{field.label}</dt>
            <dd>{rendered}</dd>
          </div>
        )
      })}
    </dl>
  )
}
