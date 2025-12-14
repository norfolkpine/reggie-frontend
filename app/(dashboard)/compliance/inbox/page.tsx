"use client";

import { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';
import { ComplianceObligation } from '@/features/compliance/types';
import { CSV_DATA } from '@/features/compliance/constants';
import { parseCSV } from '@/features/compliance/utils';
import { InboxSection } from '@/features/compliance/components/inbox-section';
import { TaskInboxCard } from '@/features/compliance/components/task-inbox-card';

export default function ComplianceInboxPage() {
  const [data, setData] = useState<ComplianceObligation[]>([]);
  const [focusMode, setFocusMode] = useState(false);
  const [searchQuery] = useState('');
  const [selectedFreq] = useState<string>('All');
  const [showOverdueOnly] = useState(false);

  useEffect(() => {
    const parsed = parseCSV(CSV_DATA);
    setData(parsed);
  }, []);

  // Filter data
  const filteredData = useMemo(() => {
    let processed = data.filter(item => {
      const matchesFreq = selectedFreq === 'All' || item.frequency === selectedFreq;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.area.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesOverdue = showOverdueOnly ? item.isOverdue : true;

      return matchesFreq && matchesSearch && matchesOverdue;
    });

    // Sort by overdue first, then by date
    processed.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      if (a.nextDue && b.nextDue) return a.nextDue.getTime() - b.nextDue.getTime();
      return 0;
    });

    return processed;
  }, [data, selectedFreq, searchQuery, showOverdueOnly]);

  // Smart Inbox Grouping
  const inboxGroups = useMemo(() => {
    const groups = {
      overdue: [] as ComplianceObligation[],
      today: [] as ComplianceObligation[],
      week: [] as ComplianceObligation[],
      upcoming: [] as ComplianceObligation[],
      completed: [] as ComplianceObligation[],
    };

    const today = new Date();
    today.setHours(0,0,0,0);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    filteredData.forEach(task => {
      if (task.status === 'Completed') {
        groups.completed.push(task);
        return;
      }

      if (task.isOverdue) {
        groups.overdue.push(task);
        return;
      }

      if (!task.nextDue) {
        groups.upcoming.push(task);
        return;
      }

      const dueDate = new Date(task.nextDue);
      dueDate.setHours(0,0,0,0);

      if (dueDate.getTime() === today.getTime()) {
        groups.today.push(task);
      } else if (dueDate <= endOfWeek) {
        groups.week.push(task);
      } else {
        groups.upcoming.push(task);
      }
    });

    return groups;
  }, [filteredData]);

  const handleCompleteTask = async (id: string) => {
    // Optimistic Update
    setData(prev => prev.map(t => t.id === id ? { ...t, status: 'Completed', isOverdue: false } : t));
  };

  return (
    <div className="flex-1 p-6">
      <div className="h-full flex flex-col animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
        {/* Inbox Controls */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">My Priorities</h3>
            <p className="text-sm text-slate-500">Focus on urgent and upcoming tasks.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${focusMode ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}
            >
              {focusMode ? <Eye size={16} /> : <EyeOff size={16} />}
              Focus Mode
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-2">

          {/* 1. Overdue */}
          <InboxSection
            title="Overdue"
            count={inboxGroups.overdue.length}
            color="text-rose-600"
            icon={AlertTriangle}
          >
            {inboxGroups.overdue.map(task => (
              <TaskInboxCard key={task.id} task={task} onAction={handleCompleteTask} />
            ))}
          </InboxSection>

          {/* 2. Today */}
          <InboxSection
            title="Due Today"
            count={inboxGroups.today.length}
            color="text-indigo-600"
            icon={CalendarClock}
          >
            {inboxGroups.today.map(task => (
              <TaskInboxCard key={task.id} task={task} onAction={handleCompleteTask} />
            ))}
          </InboxSection>

          {/* 3. This Week */}
          <InboxSection
            title="Due This Week"
            count={inboxGroups.week.length}
            color="text-amber-600"
            icon={CalendarDays}
          >
            {inboxGroups.week.map(task => (
              <TaskInboxCard key={task.id} task={task} onAction={handleCompleteTask} />
            ))}
          </InboxSection>

          {/* 4. Upcoming */}
          {!focusMode && (
            <InboxSection
              title="Upcoming"
              count={inboxGroups.upcoming.length}
              color="text-blue-600"
              icon={Sparkles}
              defaultOpen={false}
            >
              {inboxGroups.upcoming.map(task => (
                <TaskInboxCard key={task.id} task={task} onAction={handleCompleteTask} />
              ))}
            </InboxSection>
          )}

          {/* 5. Completed */}
          {!focusMode && (
            <InboxSection
              title="Completed"
              count={inboxGroups.completed.length}
              color="text-emerald-600"
              icon={CheckCircle2}
              defaultOpen={false}
            >
              {inboxGroups.completed.map(task => (
                <TaskInboxCard key={task.id} task={task} onAction={handleCompleteTask} />
              ))}
            </InboxSection>
          )}

          {inboxGroups.overdue.length === 0 && inboxGroups.today.length === 0 && inboxGroups.week.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="bg-emerald-50 text-emerald-500 p-4 rounded-full mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-slate-700 font-bold">All caught up!</h3>
              <p>You have no urgent tasks for this week.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

