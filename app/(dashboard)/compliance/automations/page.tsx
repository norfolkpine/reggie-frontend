"use client";

import { useState, useMemo, useEffect } from 'react';
import {
  Bot,
  Zap,
  ShieldCheck,
  ArrowUpDown,
  Timer,
  CalendarClock,
  Clock,
  Settings,
  PlayCircle,
  CheckSquare
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ComplianceObligation, DashboardStats, AutomationAgent } from '@/features/compliance/types';
import { CSV_DATA } from '@/features/compliance/constants';
import { parseCSV } from '@/features/compliance/utils';

export default function ComplianceAutomationsPage() {
  const [data, setData] = useState<ComplianceObligation[]>([]);
  const [agents, setAgents] = useState<AutomationAgent[]>([]);

  useEffect(() => {
    const parsed = parseCSV(CSV_DATA);
    setData(parsed);

    // Generate suggested agents
    const freqCounts: Record<string, number> = {};
    parsed.forEach(p => {
      freqCounts[p.frequency] = (freqCounts[p.frequency] || 0) + 1;
    });

    const newAgents: AutomationAgent[] = [
      {
        id: 'agent-daily',
        name: 'Daily Compliance Sentinel',
        description: 'Runs checks for bank reconciliations, cash flow monitoring, and daily record keeping.',
        type: 'Scheduled',
        frequency: 'Daily',
        triggerDisplay: 'Every day at 09:00 AM',
        linkedObligationsCount: freqCounts['Daily'] || 0,
        status: 'Active',
        lastRun: new Date(new Date().setHours(9, 0, 0, 0)),
        successRate: 98
      },
      {
        id: 'agent-monthly',
        name: 'Monthly Reporting Auditor',
        description: 'Compiles NTA calculations, debt monitoring, and generates draft board reports.',
        type: 'Scheduled',
        frequency: 'Monthly',
        triggerDisplay: '1st of every month at 06:00 AM',
        linkedObligationsCount: freqCounts['Monthly'] || 0,
        status: 'Active',
        lastRun: new Date('2025-09-01T06:00:00'),
        successRate: 100
      },
      {
        id: 'agent-trigger',
        name: 'Application Processor',
        description: 'Instant response agent for new client applications, AML checks, and deposit verification.',
        type: 'Event-Driven',
        frequency: 'Trigger Event',
        triggerDisplay: 'On New Application Receipt',
        linkedObligationsCount: freqCounts['Trigger Event'] || 0,
        status: 'Active',
        lastRun: new Date(),
        successRate: 99
      }
    ];
    setAgents(newAgents);
  }, []);

  // Calculate stats
  const stats: DashboardStats = useMemo(() => {
    const total = data.length;
    const completed = data.filter(d => d.status.toLowerCase().includes('completed') || d.status.toLowerCase() === 'done').length;
    const overdue = data.filter(d => d.isOverdue).length;
    const highRisk = data.filter(d => d.risk.includes('High')).length;
    const score = total === 0 ? 0 : Math.round(((total - overdue) / total) * 100);

    const aiCompleted = data.filter(d => d.aiVerified).length;
    const baseAutomated24h = 128;
    const totalAutomated = baseAutomated24h + aiCompleted;
    const hoursSaved = Math.round(totalAutomated * 0.33);

    return { total, completed, overdue, highRisk, complianceScore: score, hoursSaved };
  }, [data]);

  const toggleAgentStatus = (id: string) => {
    setAgents(prev => prev.map(a =>
      a.id === id ? { ...a, status: a.status === 'Active' ? 'Paused' : 'Active' } : a
    ));
  };

  return (
    <div className="flex-1 p-6">
      <div className="h-full overflow-y-auto pr-2 animate-in fade-in duration-500">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800">Compliance Automation Center</h3>
          <p className="text-sm text-slate-500">Configure schedule-based and event-driven AI agents to automate your compliance obligations.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl p-6 text-white shadow-lg shadow-indigo-200">
            <div className="flex items-center gap-3 mb-4 opacity-90">
              <Bot size={20} />
              <span className="font-medium">Active Agents</span>
            </div>
            <div className="text-4xl font-bold">{agents.filter(a => a.status === 'Active').length}</div>
            <div className="text-xs mt-2 opacity-75">Out of {agents.length} configured agents</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-slate-500">
              <Zap size={20} className="text-amber-500" />
              <span className="font-medium">Tasks Automated (24h)</span>
            </div>
            <div className="text-4xl font-bold text-slate-800">128</div>
            <div className="text-xs mt-2 text-emerald-600 font-medium flex items-center gap-1">
              <ArrowUpDown size={12} className="rotate-45" /> +12% from yesterday
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-slate-500">
              <ShieldCheck size={20} className="text-emerald-500" />
              <span className="font-medium">Success Rate</span>
            </div>
            <div className="text-4xl font-bold text-slate-800">99.2%</div>
            <div className="text-xs mt-2 text-slate-400">Last 1,000 executions</div>
          </div>
        </div>

        {/* Efficiency & ROI Section */}
        <div className="mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Timer size={20} className="text-indigo-500" />
                  Efficiency Impact
                </h4>
                <p className="text-sm text-slate-500">Comparison of estimated staff hours vs. AI compute time.</p>
              </div>
              <div className="text-left md:text-right bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="text-3xl font-bold text-indigo-700">{stats.hoursSaved} hrs</div>
                <div className="text-xs text-indigo-500 font-bold uppercase tracking-wide">Total Time Saved</div>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={[
                    { name: 'Manual Processing', hours: 42.5, color: '#94a3b8' },
                    { name: 'AI Agents', hours: 1.2, color: '#6366f1' }
                  ]}
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" unit="h" stroke="#64748b" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={120} tick={{ fill: '#475569', fontWeight: 500 }} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="hours" radius={[0, 4, 4, 0]} barSize={40}>
                    {
                      [{ color: '#94a3b8' }, { color: '#6366f1' }].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Agent List */}
        <div className="space-y-6">
          {/* Scheduled Agents */}
          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CalendarClock size={16} /> Scheduled Automations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.filter(a => a.type === 'Scheduled').map(agent => (
                <div key={agent.id} className={`bg-white border rounded-xl p-5 shadow-sm transition-all ${agent.status === 'Active' ? 'border-indigo-100 hover:border-indigo-300' : 'border-slate-200 opacity-75 grayscale'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${agent.status === 'Active' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Bot size={20} />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">{agent.name}</h5>
                        <span className="text-xs text-slate-400">{agent.frequency}</span>
                      </div>
                    </div>
                    <div onClick={() => toggleAgentStatus(agent.id)} className={`cursor-pointer w-10 h-6 rounded-full p-1 transition-colors ${agent.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${agent.status === 'Active' ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 h-10 line-clamp-2">{agent.description}</p>

                  <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock size={14} />
                      {agent.triggerDisplay}
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600">
                        <Settings size={14} />
                      </button>
                      <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600">
                        <PlayCircle size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Driven Agents */}
          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 mt-8">
              <Zap size={16} /> Event-Driven Automations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.filter(a => a.type === 'Event-Driven').map(agent => (
                <div key={agent.id} className="bg-white border border-indigo-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Zap size={20} />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">{agent.name}</h5>
                        <span className="text-xs text-slate-400">Trigger: {agent.triggerDisplay}</span>
                      </div>
                    </div>
                    <div onClick={() => toggleAgentStatus(agent.id)} className={`cursor-pointer w-10 h-6 rounded-full p-1 transition-colors ${agent.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${agent.status === 'Active' ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-4 h-10 line-clamp-2">{agent.description}</p>

                  <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <CheckSquare size={14} />
                      {agent.linkedObligationsCount} Linked Obligations
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600">
                        <Settings size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

