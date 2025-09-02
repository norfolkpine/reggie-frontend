import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, FileText } from 'lucide-react'

export default function SettingsBilling() {
  const [currentPlan, setCurrentPlan] = useState('pro')
  const [spendingLimit, setSpendingLimit] = useState(1000)

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
          <CardTitle>Plans and Usage</CardTitle>
          <CardDescription>View your current plan and usage details. Adjust your plan as needed.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup defaultValue={currentPlan} onValueChange={setCurrentPlan} className="grid grid-cols-3 gap-4">
            <Label
              htmlFor="basic"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="basic" id="basic" className="sr-only" />
              <BarChart className="mb-3 h-6 w-6" />
              <span className="text-sm font-medium">Basic</span>
            </Label>
            <Label
              htmlFor="pro"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="pro" id="pro" className="sr-only" />
              <BarChart className="mb-3 h-6 w-6" />
              <span className="text-sm font-medium">Pro</span>
            </Label>
            <Label
              htmlFor="enterprise"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="enterprise" id="enterprise" className="sr-only" />
              <BarChart className="mb-3 h-6 w-6" />
              <span className="text-sm font-medium">Enterprise</span>
            </Label>
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button>Update Plan</Button>
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
    </div>
  )
}