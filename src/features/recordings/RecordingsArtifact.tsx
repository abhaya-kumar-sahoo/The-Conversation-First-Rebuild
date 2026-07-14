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
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, PlayCircle, FileText, Download } from 'lucide-react';
import { useGetRecordingsQuery } from '@/store/api/apiSlice';
import { motion } from 'framer-motion';
import type { Artifact, Recording } from '@/types';

const SENTIMENT_COLORS: Record<string, string> = {
  positive: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  neutral: 'text-[#a1a1aa] bg-[#27272a] border-[#3f3f46]',
  negative: 'text-red-400 bg-red-400/10 border-red-400/20',
};

interface RecordingsArtifactProps {
  artifact: Artifact;
}

export default function RecordingsArtifact({ artifact: _artifact }: RecordingsArtifactProps) {
  const { data: recordings = [], isLoading } = useGetRecordingsQuery();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const columns = useMemo<ColumnDef<Recording>[]>(() => [
    {
      accessorKey: 'play',
      header: '',
      cell: () => (
        <button className="text-violet-400 hover:text-violet-300 transition-colors">
          <PlayCircle size={18} />
        </button>
      ),
      size: 40,
    },
    {
      accessorKey: 'contactName',
      header: 'Contact',
      cell: ({ row }) => (
        <div>
          <div className="text-xs font-medium text-white">{row.original.contactName}</div>
          <div className="text-[10px] text-[#52525b]">{row.original.type === 'inbound' ? 'Inbound' : 'Outbound'}</div>
        </div>
      ),
    },
    {
      accessorKey: 'agentName',
      header: 'Agent',
      cell: ({ getValue }) => <span className="text-xs text-[#a1a1aa]">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'queueName',
      header: 'Queue',
      cell: ({ getValue }) => <span className="text-xs text-[#71717a]">{getValue<string>()}</span>,
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      cell: ({ getValue }) => <span className="text-xs font-mono text-[#a1a1aa]">{formatDuration(getValue<number>())}</span>,
    },
    {
      accessorKey: 'sentiment',
      header: 'Sentiment',
      cell: ({ getValue }) => {
        const val = getValue<string>();
        return (
          <span className={`text-[10px] px-2 py-0.5 rounded-md border capitalize ${SENTIMENT_COLORS[val]}`}>
            {val}
          </span>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ getValue }) => (
        <span className="text-[10px] text-[#52525b]">
          {new Date(getValue<string>()).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      accessorKey: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.transcriptAvailable && (
            <button className="text-[#52525b] hover:text-[#a1a1aa] transition-colors" title="View Transcript">
              <FileText size={14} />
            </button>
          )}
          <button className="text-[#52525b] hover:text-[#a1a1aa] transition-colors" title="Download">
            <Download size={14} />
          </button>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data: recordings,
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
    return <div className="p-5 space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="shimmer h-12 rounded-lg" />)}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[#27272a] flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a]">
          <Search size={12} className="text-[#52525b]" />
          <input
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            placeholder="Search recordings by agent, contact or queue..."
            className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-[#52525b]"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="sticky top-0 bg-[#0f0f12] border-b border-[#27272a] z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-2.5 text-left text-[10px] font-semibold text-[#52525b] uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    style={{ minWidth: header.id === 'duration' || header.id === 'sentiment' ? '100px' : 'auto' }}
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
        <span className="text-[10px] text-[#52525b]">{recordings.length} recordings</span>
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
