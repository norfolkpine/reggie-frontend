"use client";

import { useState, useEffect } from 'react';
import { ComplianceObligation } from '@/features/compliance/types';
import { CSV_DATA } from '@/features/compliance/constants';
import { parseCSV } from '@/features/compliance/utils';
import { CalendarView } from '@/features/compliance/components';

export default function ComplianceSchedulePage() {
  const [data, setData] = useState<ComplianceObligation[]>([]);

  useEffect(() => {
    const parsed = parseCSV(CSV_DATA);
    setData(parsed);
  }, []);

  return (
    <div className="flex-1 p-6 flex flex-col overflow-hidden">
      <CalendarView data={data} />
    </div>
  );
}

