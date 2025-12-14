"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ComplianceObligation } from '../types';

interface CalendarViewProps {
  data: ComplianceObligation[];
}

export const CalendarView = ({ data }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 is Sunday

  // Calculate total cells needed (should be multiple of 7)
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const trailingBlanks = Array(totalCells - firstDay - daysInMonth).fill(null);

  const getTasksForDay = (day: number) => {
    return data.filter(task => {
      if (!task.nextDue) return false;
      return task.nextDue.getDate() === day &&
             task.nextDue.getMonth() === currentDate.getMonth() &&
             task.nextDue.getFullYear() === currentDate.getFullYear();
    });
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-800">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-2">
          <button onClick={goToPreviousMonth} className="p-1 hover:bg-slate-100 rounded">
            <ChevronDown className="rotate-90" size={20} />
          </button>
          <button onClick={goToToday} className="text-xs px-2 py-1 bg-slate-100 rounded hover:bg-slate-200 font-medium">Today</button>
          <button onClick={goToNextMonth} className="p-1 hover:bg-slate-100 rounded">
            <ChevronDown className="-rotate-90" size={20} />
          </button>
        </div>
      </div>

      <div className="calendar-grid text-center border-b border-slate-200 bg-slate-50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-2 text-xs font-semibold text-slate-500 uppercase">{d}</div>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="calendar-grid h-full overflow-y-auto" style={{ gridAutoRows: '1fr' }}>
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="border-b border-r border-slate-100 bg-slate-50/30 min-h-[100px]" />
        ))}
        {days.map(day => {
          const tasks = getTasksForDay(day);
          const today = new Date();
          const isToday = today.getDate() === day &&
                         today.getMonth() === currentDate.getMonth() &&
                         today.getFullYear() === currentDate.getFullYear();

          return (
            <div key={day} className={`border-b border-r border-slate-100 p-2 relative group hover:bg-slate-50 transition-colors min-h-[100px] ${isToday ? 'bg-indigo-50/30' : ''}`}>
              <span className={`text-sm font-medium ${isToday ? 'bg-indigo-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center' : 'text-slate-700'}`}>{day}</span>

              <div className="mt-2 space-y-1">
                {tasks.slice(0, 3).map(task => (
                  <div key={task.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate border-l-2 ${
                    task.isOverdue
                      ? 'bg-rose-50 border-rose-500 text-rose-700'
                      : task.status === 'Completed'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'bg-blue-50 border-blue-500 text-blue-700'
                  }`}>
                    {task.name}
                  </div>
                ))}
                {tasks.length > 3 && (
                  <div className="text-[10px] text-slate-400 pl-1">
                    + {tasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {trailingBlanks.map((_, i) => (
          <div key={`trailing-${i}`} className="border-b border-r border-slate-100 bg-slate-50/30 min-h-[100px]" />
        ))}
        </div>
      </div>
      <style jsx>{`
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
        }
      `}</style>
    </div>
  );
};
