"use client";

import React from "react";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { PageHeader } from "@/components/ui/page-header";
import { useHeader } from "@/contexts/header-context";
import { useEffect } from "react";

export default function PricingPage() {
  const { setHeaderActions, setHeaderCustomContent } = useHeader();

  useEffect(() => {
    // Set page title and description
    setHeaderCustomContent(
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Pricing
        </h1>
        <p className="text-muted-foreground">
          Choose the perfect plan for your team.
        </p>
      </div>
    );

    // Set header actions (optional)
    setHeaderActions([]);

    // Cleanup on unmount
    return () => {
      setHeaderCustomContent(null);
      setHeaderActions([]);
    };
  }, [setHeaderActions, setHeaderCustomContent]);

  const handlePlanSelect = (planId: string) => {
    console.log("Selected plan:", planId);
    // Handle plan selection logic here
    // This could redirect to a signup page, open a contact form, etc.
  };

  const handleBillingCycleChange = (cycle: "monthly" | "yearly") => {
    console.log("Billing cycle changed to:", cycle);
    // Handle billing cycle change if needed
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <PricingCards
        viewMode="standalone"
        onPlanSelect={handlePlanSelect}
        onBillingCycleChange={handleBillingCycleChange}
      />
    </div>
  );
}
