"use client";

import { useState, useMemo, useEffect } from 'react';
import { PieChart, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { ComplianceObligation, DashboardStats } from '@/features/compliance/types';
import { CSV_DATA } from '@/features/compliance/constants';
import { parseCSV } from '@/features/compliance/utils';

export default function ComplianceReportsPage() {
  const [data, setData] = useState<ComplianceObligation[]>([]);

  useEffect(() => {
    const parsed = parseCSV(CSV_DATA);
    setData(parsed);
  }, []);

  // Calculate stats
  const stats: DashboardStats = useMemo(() => {
    const total = data.length;
    const completed = data.filter(d => d.status.toLowerCase().includes('completed') || d.status.toLowerCase() === 'done').length;
    const overdue = data.filter(d => d.isOverdue).length;
    const highRisk = data.filter(d => d.risk.includes('High')).length;
    const score = total === 0 ? 0 : Math.round(((total - overdue) / total) * 100);

    // Simulate hours saved.
    // Assumption: 1 automated task saves approx 20 minutes (0.33 hours).
    const aiCompleted = data.filter(d => d.aiVerified).length;
    const baseAutomated24h = 128; // From mock data
    const totalAutomated = baseAutomated24h + aiCompleted;
    const hoursSaved = Math.round(totalAutomated * 0.33);

    return { total, completed, overdue, highRisk, complianceScore: score, hoursSaved };
  }, [data]);

  return (
    <div className="flex-1 p-6">
      <div className="space-y-6 overflow-y-auto h-full pr-2 animate-in fade-in duration-500">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Obligations</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2">{stats.total}</h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <PieChart size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Overdue Items</p>
                <h3 className="text-3xl font-bold text-rose-600 mt-2">{stats.overdue}</h3>
              </div>
              <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">High Risk Items</p>
                <h3 className="text-3xl font-bold text-amber-600 mt-2">{stats.highRisk}</h3>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <ShieldCheck size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Hours Saved (AI)</p>
                <h3 className="text-3xl font-bold text-indigo-600 mt-2">{stats.hoursSaved}h</h3>
              </div>
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Sparkles size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

