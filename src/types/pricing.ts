export interface PricingFeature {
  name: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number | string;
  yearlyPrice: number | string;
  yearlySavings?: number;
  features: PricingFeature[];
  recommended?: boolean;
  popular?: boolean;
  ctaText: string;
  ctaVariant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
}

export interface PricingCardsProps {
  viewMode?: 'standalone' | 'modal';
  billingCycle?: 'monthly' | 'yearly';
  onBillingCycleChange?: (cycle: 'monthly' | 'yearly') => void;
  onPlanSelect?: (planId: string) => void;
  className?: string;
}

export interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  onPlanSelect?: (planId: string) => void;
  className?: string;
}

export type BillingCycle = 'monthly' | 'yearly';
