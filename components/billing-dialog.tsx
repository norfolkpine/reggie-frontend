"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface BillingDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function BillingDialog({ open, onOpenChange }: BillingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Billing & Subscription</DialogTitle>
          <DialogDescription>
            Manage your subscription and billing information
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Free Plan</CardTitle>
                <CardDescription>Current Plan</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>5 projects</li>
                  <li>Basic analytics</li>
                  <li>48-hour support response time</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" disabled>Current Plan</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pro Plan</CardTitle>
                <CardDescription>$10/month</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>Unlimited projects</li>
                  <li>Advanced analytics</li>
                  <li>24/7 priority support</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Upgrade</Button>
              </CardFooter>
            </Card>
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full">View Billing History</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}