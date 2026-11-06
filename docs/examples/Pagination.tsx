import { useState } from 'react'
import { Pagination } from '@batype/ui'
import '@batype/ui/style.css'

export default function PaginationExample() {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  return (
    <Pagination
      page={page}
      pageSize={size}
      total={96}
      onPageChange={setPage}
      onPageSizeChange={(next) => {
        setSize(next)
        setPage(1)
      }}
    />
  )
}
