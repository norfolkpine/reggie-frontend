'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Settings } from 'lucide-react'
import { PricingModal } from "@/components/pricing/pricing-modal"
import { PricingPlan } from "@/types/pricing"

export default function SettingsBilling() {
  const [currentPlan, setCurrentPlan] = useState('pro')
  const [spendingLimit, setSpendingLimit] = useState(1000)
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false)

  // Sample plan data - in a real app, this would come from your API
  const currentPlanData: PricingPlan = {
    id: 'pro',
    name: 'Pro',
    description: 'For solo builders and small teams running workflows in production.',
    monthlyPrice: 50,
    yearlyPrice: 50,
    features: [
      { name: '3 shared projects', included: true },
      { name: '20 concurrent executions', included: true },
      { name: '7 days of insights', included: true },
      { name: 'Admin roles', included: true },
      { name: 'Global variables', included: true },
      { name: 'Workflow history', included: true },
      { name: 'Execution search', included: true },
    ],
    ctaText: 'Current Plan',
    ctaVariant: 'outline',
  }

  const handlePlanSelect = (planId: string) => {
    setCurrentPlan(planId)
    // Here you would typically make an API call to update the user's plan
    console.log('Plan selected:', planId)
  }

  // Sample billing history data
  const billingHistory = [
    { id: 1, date: '2023-05-01', description: 'Monthly subscription - Pro Plan', amount: 49.99 },
    { id: 2, date: '2023-04-01', description: 'Monthly subscription - Pro Plan', amount: 49.99 },
    { id: 3, date: '2023-03-01', description: 'Monthly subscription - Basic Plan', amount: 29.99 },
  ]

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>View your current plan details and manage your subscription.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{currentPlanData.name}</h3>
                <p className="text-sm font-medium text-primary">
                  ${currentPlanData.monthlyPrice} AUD/month
                </p>
              </div>
            </div>
            
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setIsPricingModalOpen(true)}>
            Change Plan
          </Button>
          <Button variant="outline">
            Cancel Subscription
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spending Limits</CardTitle>
          <CardDescription>Set and manage spending limits for your account to control costs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="spending-limit">Monthly Spending Limit</Label>
            <Input
              id="spending-limit"
              type="number"
              value={spendingLimit}
              onChange={(e) => setSpendingLimit(Number(e.target.value))}
              className="w-24"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="limit-active" />
            <Label htmlFor="limit-active">Activate spending limit</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
          <CardDescription>Update your payment methods and view billing history.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-number">Card Number</Label>
            <Input id="card-number" placeholder="1234 5678 9012 3456" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry-date">Expiry Date</Label>
              <Input id="expiry-date" placeholder="MM/YY" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input id="cvc" placeholder="123" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Update Payment Info</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past transactions and billing details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            <FileText className="mr-2 h-4 w-4" />
            Download Invoice
          </Button>
        </CardFooter>
      </Card>

      {/* Pricing Modal */}
      <PricingModal
        open={isPricingModalOpen}
        onOpenChange={setIsPricingModalOpen}
        onPlanSelect={handlePlanSelect}
      />
    </div>
  )
}