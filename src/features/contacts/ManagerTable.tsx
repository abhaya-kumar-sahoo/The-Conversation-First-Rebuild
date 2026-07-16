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
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useGetManagersQuery } from '@/store/api/apiSlice';
import { motion } from 'framer-motion';
import type { Artifact, Manager } from '@/types';

interface ManagerTableProps {
  artifact: Artifact;
}

export default function ManagerTable({ artifact: _artifact }: ManagerTableProps) {
  const { data: managers = [], isLoading } = useGetManagersQuery();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<Manager>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Manager',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gradient-to-br from-teal-600 to-indigo-600 flex items-center justify-center text-xs font-semibold text-white">
            {row.original.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="text-xs font-medium text-white">{row.original.name}</div>
            <div className="text-[10px] text-[#52525b]">{row.original.role}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ getValue }) => (
        <span className="text-xs text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded-full">
          {getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: 'agentsManaged',
      header: 'Team Size',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-1.5">
          <Users size={11} className="text-[#52525b]" />
          <span className="text-xs text-[#a1a1aa]">{getValue<number>()} agents</span>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ getValue }) => <span className="text-xs text-[#71717a]">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ getValue }) => <span className="text-xs text-[#a1a1aa]">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'joinedAt',
      header: 'Joined',
      cell: ({ getValue }) => (
        <span className="text-xs text-[#52525b]">
          {new Date(getValue<string>()).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
        </span>
      ),
    },
  ], []);

  const table = useReactTable({
    data: managers,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  if (isLoading) {
    return <div className="p-5 space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="shimmer h-12 rounded-lg" />)}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[#27272a] flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a]">
          <Search size={12} className="text-[#52525b]" />
          <input
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Search managers..."
            className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-[#52525b]"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-[#0f0f12] border-b border-[#27272a]">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-2.5 text-left text-[10px] font-semibold text-[#52525b] uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
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
                transition={{ delay: i * 0.04 }}
                className="border-b border-[#1e1e23] hover:bg-[#18181b] transition-colors"
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-[#27272a] flex items-center justify-between">
        <span className="text-[10px] text-[#52525b]">{managers.length} managers</span>
        <div className="flex items-center gap-1">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:text-white hover:bg-[#27272a] disabled:opacity-30 transition-colors">
            <ChevronLeft size={13} />
          </button>
          <span className="text-xs text-[#71717a] px-2">{table.getState().pagination.pageIndex + 1} / {table.getPageCount()}</span>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="w-7 h-7 flex items-center justify-center rounded-md text-[#71717a] hover:text-white hover:bg-[#27272a] disabled:opacity-30 transition-colors">
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
