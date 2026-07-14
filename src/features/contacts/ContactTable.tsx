import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from '@tanstack/react-table';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Phone, Mail } from 'lucide-react';
import { useGetContactsQuery } from '@/store/api/apiSlice';
import type { Artifact, Contact } from '@/types';
import { motion } from 'framer-motion';

const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-400 bg-emerald-400/10',
  inactive: 'text-[#71717a] bg-[#27272a]',
  blocked: 'text-red-400 bg-red-400/10',
};

interface ContactTableProps {
  artifact: Artifact;
}

export default function ContactTable({ artifact: _artifact }: ContactTableProps) {
  const { data: contacts = [], isLoading } = useGetContactsQuery();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const columns = useMemo<ColumnDef<Contact>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="accent-violet-500 w-3.5 h-3.5"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="accent-violet-500 w-3.5 h-3.5"
        />
      ),
      size: 40,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#27272a] flex items-center justify-center text-xs font-semibold text-[#a1a1aa] flex-shrink-0">
            {row.original.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="text-xs font-medium text-white">{row.original.name}</div>
            <div className="text-[10px] text-[#52525b]">{row.original.company}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1.5 text-xs text-[#a1a1aa]">
          <Phone size={11} className="text-[#52525b]" />
          {getValue<string>()}
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1.5 text-xs text-[#a1a1aa]">
          <Mail size={11} className="text-[#52525b]" />
          <span className="truncate max-w-[140px]">{getValue<string>()}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue<string>();
        return (
          <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[status]}`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'totalCalls',
      header: 'Calls',
      cell: ({ getValue }) => <span className="text-xs text-[#a1a1aa]">{getValue<number>()}</span>,
    },
    {
      accessorKey: 'lastContact',
      header: 'Last Contact',
      cell: ({ getValue }) => (
        <span className="text-xs text-[#52525b]">
          {new Date(getValue<string>()).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ getValue }) => (
        <div className="flex gap-1 flex-wrap">
          {(getValue<string[]>()).slice(0, 2).map(tag => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-[#27272a] text-[#71717a]">{tag}</span>
          ))}
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: contacts,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 6 } },
  });

  const selectedCount = Object.keys(rowSelection).length;

  if (isLoading) {
    return <div className="p-5 space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="shimmer h-10 rounded-lg" />)}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-[#27272a] flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a]">
          <Search size={12} className="text-[#52525b]" />
          <input
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Search contacts..."
            className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-[#52525b]"
          />
        </div>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
          >
            <span className="text-xs text-violet-400">{selectedCount} selected</span>
            <button className="text-xs px-2.5 py-1.5 rounded-lg bg-[#27272a] text-[#a1a1aa] hover:text-white transition-colors">
              Export
            </button>
            <button className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
              Delete
            </button>
          </motion.div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-[#0f0f12] border-b border-[#27272a]">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-2.5 text-left text-[10px] font-semibold text-[#52525b] uppercase tracking-wider cursor-pointer select-none hover:text-white transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && <ChevronUp size={10} />}
                      {header.column.getIsSorted() === 'desc' && <ChevronDown size={10} />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-[#1e1e23] hover:bg-[#18181b] transition-colors"
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-[#27272a] flex items-center justify-between">
        <span className="text-[10px] text-[#52525b]">
          {table.getFilteredRowModel().rows.length} contacts
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:text-white hover:bg-[#27272a] disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={13} />
          </button>
          <span className="text-xs text-[#71717a] px-2">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:text-white hover:bg-[#27272a] disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
