"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"

export function DataTable({
  columns,
  data,
  pagination,
  onPageChange,
  onSort,
  onBulkAction,
  onExport,
  selectable = false,
}) {
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" })

  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
    onSort?.(key, direction)
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(new Set(data.map((row) => row.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (id, checked) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedRows(newSelected)
  }

  return (
    <div className="space-y-4">
      {selectedRows.size > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <span className="text-sm text-muted-foreground">{selectedRows.size} selected</span>
          <Button size="sm" variant="outline" onClick={() => onBulkAction?.("delete", Array.from(selectedRows))}>
            Delete Selected
          </Button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-full overflow-x-auto rounded-md border">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRows.size === data.length && data.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={column.sortable ? "cursor-pointer hover:bg-muted" : ""}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {column.sortable && sortConfig.key === column.key && (
                      <span className="text-xs">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                {selectable && (
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(row.id)}
                      onCheckedChange={(checked) => handleSelectRow(row.id, checked)}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {pagination.from} to {pagination.to} of {pagination.total} results
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <span className="text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
