'use client'

import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Sparkles,
  CreditCard,
  BarChart2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { PricingModal } from '@/components/pricing/pricing-modal'
import { BillingHistoryCard } from '@/components/billing/BillingHistoryCard'

type PlanId = 'free' | 'pro' | 'team'

interface ClaudeStylePlan {
  id: PlanId
  name: string
  price: string
  priceNote?: string
  badge?: string
  description: string
  highlights: string[]
}

const CLAUDE_STYLE_PLANS: ClaudeStylePlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    priceNote: 'For trying things out',
    description:
      'Great for exploring the product and running smaller workflows.',
    highlights: [
      'Limited daily usage',
      'Access to core AI assistant features',
      'Basic document uploads',
      'Standard support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$20',
    priceNote: 'per member / month',
    badge: 'Most popular',
    description: 'For power users who rely on the assistant every day.',
    highlights: [
      '3–5× more usage than Free',
      'Priority access during busy times',
      'Access to advanced analysis tools',
      'Early access to new features',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    price: 'Talk to sales',
    priceNote: 'For fast-growing teams',
    description:
      'For teams that need shared workspaces, admin controls, and higher limits.',
    highlights: [
      'Shared team workspaces',
      'Central billing & admin controls',
      'Higher usage limits and SLAs',
      'Dedicated onboarding support',
    ],
  },
]

export default function SettingsBilling() {
  const [currentPlanId, setCurrentPlanId] = useState<PlanId>('pro')
  const [spendingLimit, setSpendingLimit] = useState<number | ''>(1000)
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false)

  // Dummy usage – replace with data from backend/Stripe when ready
  const usage = useMemo(
    () => ({
      messagesUsed: 3200,
      messagesQuota:
        currentPlanId === 'free'
          ? 5000
          : currentPlanId === 'pro'
          ? 25000
          : 100000,
      filesUsed: 40,
      filesQuota:
        currentPlanId === 'free'
          ? 50
          : currentPlanId === 'pro'
          ? 250
          : 1000,
      teamSeats: currentPlanId === 'team' ? 12 : 1,
    }),
    [currentPlanId],
  )

  // Billing history to be passed to BillingHistoryCard
  const billingHistory = [
    { date: '2025-05-01', description: 'Pro plan – monthly', amount: '$20.00' },
    { date: '2025-04-01', description: 'Pro plan – monthly', amount: '$20.00' },
    { date: '2025-03-01', description: 'Pro plan – monthly', amount: '$20.00' },
  ]

  const currentPlan =
    CLAUDE_STYLE_PLANS.find((plan) => plan.id === currentPlanId) ??
    CLAUDE_STYLE_PLANS[1]

  const handlePlanSelect = (planId: string) => {
    if (planId === 'free' || planId === 'pro' || planId === 'team') {
      setCurrentPlanId(planId)
    }

    // TODO: connect to backend API (Stripe/subscription update) when ready
    console.log('Plan selected:', planId)
  }

  const usagePercentage = (used: number, quota: number) => {
    if (!quota) return 0
    return Math.min(100, Math.round((used / quota) * 100))
  }

  const handleSpendingLimitChange = (value: string) => {
    if (value === '') {
      setSpendingLimit('')
      return
    }
    const numeric = Number(value.replace(/[^0-9]/g, ''))
    setSpendingLimit(Number.isNaN(numeric) ? '' : numeric)
  }

  // Optional: hook for invoice download (connect to backend when ready)
  const handleDownloadInvoice = async (options: {
    deliveryMethod: 'download' | 'email'
    email: string
    includeUsage: boolean
    includeTax: boolean
    invoice: { date: string; description: string; amount: string }
  }) => {
    console.log('Download invoice from SettingsBilling:', options)
    // TODO: call backend API here when ready
  }

  return (
    <div className='space-y-8'>
      {/* HERO SECTION – vibe SaaS modern seperti Claude */}
      <section className='flex flex-col md:flex-row gap-6 items-start justify-between rounded-2xl border bg-gradient-to-br from-background via-background to-muted px-6 py-6 md:px-8 md:py-8'>
        <div className='space-y-3 max-w-xl'>
          <div className='inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium'>
            <Sparkles className='h-3.5 w-3.5' />
            <span>Subscription & Usage</span>
          </div>
          <div>
            <h2 className='text-2xl md:text-3xl font-semibold tracking-tight'>
              Stay in flow with the right plan
            </h2>
            <p className='mt-2 text-sm md:text-base text-muted-foreground'>
              Manage your subscription, monitor usage, and upgrade when
              you&apos;re ready — clean and focused, similar to modern AI tools
              like Claude.
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-3 text-sm'>
            <Badge variant='outline' className='rounded-full'>
              Current plan:
              <span className='ml-1 font-semibold'>{currentPlan.name}</span>
            </Badge>
            <span className='text-muted-foreground'>
              {usage.messagesUsed.toLocaleString()} /{' '}
              {usage.messagesQuota.toLocaleString()} messages this month
            </span>
          </div>
        </div>

        <div className='w-full md:w-auto flex flex-col items-stretch md:items-end gap-3'>
          <div className='text-right space-y-1'>
            <p className='text-xs uppercase tracking-[0.14em] text-muted-foreground'>
              Upgrade options
            </p>
            <p className='text-sm text-muted-foreground'>
              Unlock more usage, priority access, and team features with Pro or
              Team.
            </p>
          </div>
          <div className='flex flex-wrap gap-3 justify-end'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsPricingModalOpen(true)}
              className='inline-flex items-center gap-2'
            >
              View plans
              <ArrowRight className='h-3.5 w-3.5' />
            </Button>
            <Button
              size='sm'
              className='inline-flex items-center gap-2'
              onClick={() => setIsPricingModalOpen(true)}
            >
              <Sparkles className='h-4 w-4' />
              Upgrade subscription
            </Button>
          </div>
        </div>
      </section>

      {/* CURRENT PLAN + USAGE SUMMARY */}
      <section className='grid gap-6 md:grid-cols-3'>
        {/* Current Plan card */}
        <Card className='md:col-span-2 border-muted'>
          <CardHeader className='flex flex-row items-start justify-between gap-4'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <CreditCard className='h-4 w-4 text-primary' />
                Current plan
              </CardTitle>
              <CardDescription>
                Your active subscription and what&apos;s included.
              </CardDescription>
            </div>
            {currentPlan.badge && (
              <Badge className='rounded-full' variant='secondary'>
                {currentPlan.badge}
              </Badge>
            )}
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex flex-wrap items-baseline justify-between gap-3'>
              <div>
                <p className='text-lg font-semibold'>{currentPlan.name}</p>
                <p className='text-sm text-muted-foreground max-w-md'>
                  {currentPlan.description}
                </p>
              </div>
              <div className='text-right'>
                <p className='text-2xl font-semibold'>{currentPlan.price}</p>
                {currentPlan.priceNote && (
                  <p className='text-xs text-muted-foreground'>
                    {currentPlan.priceNote}
                  </p>
                )}
              </div>
            </div>

            <div className='grid gap-3 sm:grid-cols-2'>
              {currentPlan.highlights.map((item) => (
                <div key={item} className='flex items-start gap-2 text-sm'>
                  <CheckCircle2 className='mt-0.5 h-4 w-4 text-primary' />
                  <span className='text-muted-foreground'>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className='flex flex-wrap gap-3 justify-between'>
            <Button
              variant='outline'
              onClick={() => setIsPricingModalOpen(true)}
              className='inline-flex items-center gap-2'
            >
              Change plan
              <ArrowRight className='h-3.5 w-3.5' />
            </Button>
            <Button
              variant='ghost'
              className='text-destructive hover:text-destructive hover:bg-destructive/10'
            >
              Cancel subscription
            </Button>
          </CardFooter>
        </Card>

        {/* Usage card */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart2 className='h-4 w-4 text-primary' />
              Usage this cycle
            </CardTitle>
            <CardDescription>
              How much of your monthly quota you&apos;ve used.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex justify-between text-xs font-medium'>
                <span>Messages</span>
                <span>
                  {usage.messagesUsed.toLocaleString()} /{' '}
                  {usage.messagesQuota.toLocaleString()}
                </span>
              </div>
              <Progress
                value={usagePercentage(
                  usage.messagesUsed,
                  usage.messagesQuota,
                )}
              />
            </div>
            <div className='space-y-2'>
              <div className='flex justify-between text-xs font-medium'>
                <span>Files this month</span>
                <span>
                  {usage.filesUsed} / {usage.filesQuota}
                </span>
              </div>
              <Progress
                value={usagePercentage(usage.filesUsed, usage.filesQuota)}
              />
            </div>
            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span>Team seats</span>
              <span>{usage.teamSeats}</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* LIMIT & BILLING HISTORY */}
      <section className='grid gap-6 lg:grid-cols-2'>
        {/* Spending limit */}
        <Card>
          <CardHeader>
            <CardTitle>Spending limits</CardTitle>
            <CardDescription>
              Add an optional soft cap to help control monthly costs.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between gap-3'>
              <Label htmlFor='spending-limit'>Monthly limit (USD)</Label>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground'>$</span>
                <Input
                  id='spending-limit'
                  inputMode='numeric'
                  value={spendingLimit === '' ? '' : spendingLimit}
                  onChange={(e) => handleSpendingLimitChange(e.target.value)}
                  className='w-24 text-right'
                  placeholder='0'
                />
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Switch id='limit-active' defaultChecked />
              <Label htmlFor='limit-active'>
                Enforce limit for this workspace
              </Label>
            </div>
            <p className='text-xs text-muted-foreground'>
              When you approach this limit we&apos;ll send an email to the
              billing contact. You can still manually increase the limit at any
              time.
            </p>
          </CardContent>
          <CardFooter className='flex justify-end'>
            <Button size='sm'>Save changes</Button>
          </CardFooter>
        </Card>

        {/* Billing history – pakai komponen khusus dengan dialog */}
        <BillingHistoryCard
          invoices={billingHistory}
          onDownload={handleDownloadInvoice}
        />
      </section>

      {/* Pricing Modal – re-use komponen pricing yang sudah ada */}
      <PricingModal
        open={isPricingModalOpen}
        onOpenChange={setIsPricingModalOpen}
        onPlanSelect={handlePlanSelect}
      />
    </div>
  )
}
