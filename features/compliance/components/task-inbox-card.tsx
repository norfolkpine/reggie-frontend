"use client";

import React from 'react';
import { CheckSquare, Clock, Sparkles, Zap } from 'lucide-react';
import { ComplianceObligation } from '../types';
import { PriorityBadge } from './priority-badge';

interface TaskInboxCardProps {
  task: ComplianceObligation;
  onAction: (id: string) => void | Promise<void>;
}

export const TaskInboxCard: React.FC<TaskInboxCardProps> = ({ task, onAction }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 group">
      {/* Action / Checkbox Area */}
      <div className="pt-1">
        <button
          onClick={() => onAction(task.id)}
          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.status === 'Completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-500 text-transparent hover:text-indigo-200'}`}
        >
          <CheckSquare size={14} strokeWidth={3} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className={`font-medium text-sm leading-snug ${task.status === 'Completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
            {task.name}
          </h4>
          <PriorityBadge level={task.priority} />
        </div>

        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
           <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{task.id}</span>
           <span className="flex items-center gap-1"><Clock size={12} /> {task.frequency}</span>
           <span className="truncate max-w-[150px]" title={task.area}>{task.area}</span>
        </div>

        {/* AI Insight / Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-2">
           <div className="flex items-center gap-2">
              {task.frequency === 'Daily' || task.frequency === 'Monthly' ? (
                 <div className="flex items-center gap-1 text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">
                    <Sparkles size={10} />
                    <span>AI Enabled</span>
                 </div>
              ) : (
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                   <Zap size={10} className="text-slate-300" /> Manual
                </div>
              )}
           </div>

           <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
             <button className="text-xs font-medium text-slate-400 hover:text-slate-600">Details</button>
             <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Run Now</button>
           </div>
        </div>
      </div>
    </div>
  );
};
