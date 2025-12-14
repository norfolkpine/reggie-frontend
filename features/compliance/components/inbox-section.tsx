"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, LucideIcon } from 'lucide-react';

interface InboxSectionProps {
  title: string;
  count: number;
  color: string;
  icon: LucideIcon;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const InboxSection: React.FC<InboxSectionProps> = ({
  title,
  count,
  color,
  icon: Icon,
  children,
  defaultOpen = true
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (count === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition-colors group"
      >
        <div className={`p-1 rounded ${isOpen ? 'bg-slate-200' : 'bg-transparent'}`}>
           {isOpen ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-400" />}
        </div>
        <div className={`flex items-center gap-2 font-semibold ${color}`}>
          <Icon size={18} />
          {title}
        </div>
        <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full ml-auto group-hover:bg-white border border-slate-200">
          {count}
        </span>
      </button>

      {isOpen && (
        <div className="mt-2 pl-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};
