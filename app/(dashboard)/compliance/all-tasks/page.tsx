"use client";

import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  AlertTriangle,
  Filter,
  CheckSquare,
  Square,
  ArrowUpDown,
  MoreHorizontal,
  Loader2,
  Sparkles
} from 'lucide-react';
import { ComplianceObligation } from '@/features/compliance/types';
import { CSV_DATA } from '@/features/compliance/constants';
import { parseCSV } from '@/features/compliance/utils';
import { StatusBadge, PriorityBadge } from '@/features/compliance/components';

export default function ComplianceAllTasksPage() {
  const [data, setData] = useState<ComplianceObligation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFreq, setSelectedFreq] = useState<string>('All');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: keyof ComplianceObligation, direction: 'asc' | 'desc' } | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiProcessingIds, setAiProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const parsed = parseCSV(CSV_DATA);
    setData(parsed);
  }, []);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let processed = data.filter(item => {
      const matchesFreq = selectedFreq === 'All' || item.frequency === selectedFreq;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.area.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOverdue = showOverdueOnly ? item.isOverdue : true;

      return matchesFreq && matchesSearch && matchesOverdue;
    });

    if (sortConfig) {
      processed.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === bValue) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;
        if (aValue < bValue!) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue!) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      processed.sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        if (a.nextDue && b.nextDue) return a.nextDue.getTime() - b.nextDue.getTime();
        return 0;
      });
    }
    return processed;
  }, [data, selectedFreq, searchQuery, showOverdueOnly, sortConfig]);

  const handleSort = (key: keyof ComplianceObligation) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredData.map(d => d.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleRunAI = async () => {
    if (selectedIds.size === 0) return;
    setIsAiProcessing(true);
    const idsToProcess = new Set(selectedIds);
    setAiProcessingIds(idsToProcess);
    await new Promise(resolve => setTimeout(resolve, 2500));
    setData(prev => prev.map(item => {
      if (idsToProcess.has(item.id)) {
        return {
          ...item,
          status: 'Completed',
          notes: item.notes ? item.notes + " \n[AI Verified]" : "[AI Verified] Compliance checks passed via automated audit.",
          aiVerified: true,
          isOverdue: false
        };
      }
      return item;
    }));
    setIsAiProcessing(false);
    setAiProcessingIds(new Set());
    setSelectedIds(new Set());
  };

  const isAllSelected = filteredData.length > 0 && selectedIds.size === filteredData.length;

  return (
    <div className="flex-1 p-6 flex flex-col overflow-hidden">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full animate-in slide-in-from-bottom-2 duration-300 relative overflow-hidden">

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between bg-white z-20">
          <div className="flex gap-3 items-center flex-1 min-w-[200px]">
            <div className="relative group w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search obligations, IDs, or areas..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowOverdueOnly(!showOverdueOnly)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 transition-colors flex-shrink-0 ${showOverdueOnly ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <AlertTriangle size={14} />
              Overdue
            </button>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
              <Filter size={16} />
            </button>
          </div>

          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full">
            {['All', 'Daily', 'Monthly', 'Quarterly', 'Semi-Annual', 'Annual'].map(f => (
              <button
                key={f}
                onClick={() => setSelectedFreq(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${selectedFreq === f ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/90 backdrop-blur sticky top-0 z-10 shadow-sm text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 border-b border-slate-200 w-[50px] text-center">
                  <button onClick={handleSelectAll} className="text-slate-400 hover:text-indigo-600 align-middle">
                    {isAllSelected ? <CheckSquare size={16} className="text-indigo-600" /> : <Square size={16} />}
                  </button>
                </th>
                <th className="px-6 py-3 border-b border-slate-200 cursor-pointer hover:bg-slate-100/50 transition-colors group" onClick={() => handleSort('id')}>
                  <div className="flex items-center gap-1">ID <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="px-6 py-3 border-b border-slate-200 cursor-pointer hover:bg-slate-100/50 transition-colors group w-1/3 min-w-[300px]" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">Obligation <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="px-6 py-3 border-b border-slate-200 cursor-pointer hover:bg-slate-100/50 transition-colors group" onClick={() => handleSort('area')}>
                  <div className="flex items-center gap-1">Area <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="px-6 py-3 border-b border-slate-200 cursor-pointer hover:bg-slate-100/50 transition-colors group" onClick={() => handleSort('frequency')}>
                  <div className="flex items-center gap-1">Frequency <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="px-6 py-3 border-b border-slate-200 cursor-pointer hover:bg-slate-100/50 transition-colors group" onClick={() => handleSort('nextDue')}>
                  <div className="flex items-center gap-1">Next Due <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="px-6 py-3 border-b border-slate-200 cursor-pointer hover:bg-slate-100/50 transition-colors group" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">Status <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="px-6 py-3 border-b border-slate-200 cursor-pointer hover:bg-slate-100/50 transition-colors group" onClick={() => handleSort('risk')}>
                  <div className="flex items-center gap-1">Risk <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="px-6 py-3 border-b border-slate-200 w-[50px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <div className="bg-slate-50 p-4 rounded-full mb-3">
                        <Search size={24} className="opacity-50" />
                      </div>
                      <p>No obligations found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  const isProcessing = aiProcessingIds.has(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`group transition-colors ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50'} ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <td className="px-6 py-4 text-center">
                        {isProcessing ? (
                          <Loader2 size={16} className="animate-spin text-indigo-600 mx-auto" />
                        ) : (
                          <button onClick={() => handleSelectRow(item.id)} className={`transition-colors align-middle ${isSelected ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-400'}`}>
                            {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{item.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 text-sm leading-snug">
                          {item.name}
                        </div>
                        {item.isOverdue && !item.status.includes('Completed') && (
                          <div className="flex items-center gap-1 text-[10px] text-rose-600 font-bold mt-1">
                            <AlertTriangle size={10} /> Overdue
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.area}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">
                          {item.frequency}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap font-medium">
                        {item.nextDue ? item.nextDue.toLocaleDateString('en-AU', {day: 'numeric', month: 'short', year: 'numeric'}) : <span className="text-slate-400">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={item.status} aiVerified={item.aiVerified} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriorityBadge level={item.risk} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Floating AI Action Bar */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/90 backdrop-blur text-white shadow-2xl rounded-full px-6 py-3 transition-all duration-300 transform z-30 ${selectedIds.size > 0 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95 pointer-events-none'}`}>
          <div className="flex items-center gap-3 pr-4 border-r border-slate-700">
            <div className="bg-indigo-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {selectedIds.size}
            </div>
            <span className="text-sm font-medium">Selected</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRunAI}
              disabled={isAiProcessing}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAiProcessing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-indigo-200" />
                  Run AI Audit
                </>
              )}
            </button>
            <button className="px-3 py-1.5 hover:bg-white/10 rounded-full text-sm text-slate-300 transition-colors">
              Mark Complete
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-400 flex justify-between items-center z-20">
          <span>Showing {filteredData.length} records</span>
          <span>Last synced: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}

