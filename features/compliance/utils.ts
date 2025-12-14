import { ComplianceObligation } from './types';

export const parseCSV = (csv: string): ComplianceObligation[] => {
  const lines = csv.split('\n');
  const result: ComplianceObligation[] = [];
  const now = new Date();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
    const columns = parts ? parts.map(p => p.replace(/^"|"$/g, '').trim()) : line.split(',');

    if (columns[0]?.startsWith('PSL_')) {
      const dateStr = columns[6];
      let nextDue: Date | null = null;
      if (dateStr && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        nextDue = new Date(dateStr);
      }

      const obligation: ComplianceObligation = {
        id: columns[0],
        name: columns[1],
        area: columns[2],
        frequency: columns[3],
        nextDue: nextDue,
        status: columns[7] || 'Not Started',
        priority: columns[8] || 'Medium',
        risk: columns[9] || 'Medium',
        owner: columns[10] || 'Unassigned',
        notes: columns[11] || '',
        regReference: columns[12] || '',
        controlMeasures: columns[14] || '',
        isOverdue: nextDue ? (nextDue < now && columns[7] !== 'Completed') : false,
        aiVerified: false
      };

      // Default daily tasks to today if no date specified
      if(obligation.frequency === 'Daily') {
         if(!obligation.nextDue) obligation.nextDue = new Date();
      }

      result.push(obligation);
    }
  }
  return result;
};
