
export enum Frequency {
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Quarterly = 'Quarterly',
  SemiAnnual = 'Semi-Annual',
  Annual = 'Annual',
  AdHoc = 'Ad hoc',
  TriggerEvent = 'Trigger Event'
}

export enum PriorityLevel {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}

export enum RiskLevel {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}

export interface ComplianceObligation {
  id: string;
  name: string;
  area: string;
  frequency: string;
  nextDue: Date | null;
  status: string;
  priority: string;
  risk: string;
  owner: string;
  notes: string;
  regReference: string;
  controlMeasures: string;
  isOverdue?: boolean;
  aiVerified?: boolean; // New field to track if AI automated this
}

export interface DashboardStats {
  total: number;
  completed: number;
  overdue: number;
  highRisk: number;
  complianceScore: number;
  hoursSaved: number;
}

export interface AutomationAgent {
  id: string;
  name: string;
  description: string;
  type: 'Scheduled' | 'Event-Driven';
  frequency: string;
  triggerDisplay: string; // e.g., "Daily at 08:00 AM" or "On New Item"
  linkedObligationsCount: number;
  status: 'Active' | 'Paused';
  lastRun: Date | null;
  successRate: number;
}