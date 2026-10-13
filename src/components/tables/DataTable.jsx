import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download
} from 'lucide-react';
import { Button } from '../common/Button';
import { exportToCsv } from '../../utils/exportUtils';
import { useToast } from '../../context/ToastContext';

export function DataTable({
  data = [],
  columns = [],
  title = '',
  enableExport = true,
  exportFilename = 'table_export.csv',
  initialPageSize = 10
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const { showToast } = useToast();

  // If columns are not explicitly provided, infer them from data keys
  const tableColumns = useMemo(() => {
    if (columns && columns.length > 0) return columns;
    if (!data || data.length === 0) return [];

    return Object.keys(data[0]).map((key) => ({
      accessorKey: key,
      header: key,
      cell: (info) => {
        const val = info.getValue();
        if (val === null || val === undefined) return <span style={{ color: 'var(--text-disabled)' }}>—</span>;
        if (typeof val === 'boolean') return val ? 'True' : 'False';
        if (typeof val === 'number') return Number.isInteger(val) ? val.toLocaleString() : val.toFixed(2);
        return String(val);
      }
    }));
  }, [columns, data]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      globalFilter
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: initialPageSize
      }
    }
  });

  const handleExport = () => {
    const success = exportToCsv(data, exportFilename);
    if (success) {
      showToast(`Exported ${data.length} records to CSV`, 'success');
    } else {
      showToast('Failed to export data', 'danger');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Table Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {title && <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)' }}>{title}</h4>}
          <div className="search-input-wrapper" style={{ minWidth: 220 }}>
            <Search size={14} />
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="input-field"
              placeholder="Search in table..."
              style={{ padding: '6px 12px 6px 32px', fontSize: '0.8125rem' }}
            />
          </div>
        </div>

        {enableExport && (
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleExport}
            disabled={!data || data.length === 0}
          >
            Export CSV
          </Button>
        )}
      </div>

      {/* Table Body */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const isSorted = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        cursor: canSort ? 'pointer' : 'default',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span style={{ color: isSorted ? 'var(--accent-primary)' : 'var(--text-disabled)' }}>
                            {isSorted === 'asc' ? (
                              <ArrowUp size={13} />
                            ) : isSorted === 'desc' ? (
                              <ArrowDown size={13} />
                            ) : (
                              <ArrowUpDown size={13} />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length || 1} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                  No matching records found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '4px 0',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Showing</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="input-field"
            style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8125rem' }}
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} rows
              </option>
            ))}
          </select>
          <span>
            of <strong>{table.getFilteredRowModel().rows.length}</strong> entries
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="btn-icon"
            style={{ padding: 4, borderRadius: 4 }}
            aria-label="First page"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="btn-icon"
            style={{ padding: 4, borderRadius: 4 }}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          <span style={{ margin: '0 4px', fontWeight: 500 }}>
            Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
          </span>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="btn-icon"
            style={{ padding: 4, borderRadius: 4 }}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="btn-icon"
            style={{ padding: 4, borderRadius: 4 }}
            aria-label="Last page"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
