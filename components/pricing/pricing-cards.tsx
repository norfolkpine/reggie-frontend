"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, X } from "lucide-react";
import { PricingCardsProps, PricingPlan, BillingCycle } from "@/types/pricing";
import { cn } from "@/lib/utils";

// n8n-style pricing data (AUD currency)
const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Great for getting started and seeing the power of n8n.",
    monthlyPrice: 20,
    yearlyPrice: 20,
    yearlySavings: 0,
    features: [
      { name: "1 shared project", included: true },
      { name: "5 concurrent executions", included: true },
      { name: "Unlimited users", included: true },
    ],
    ctaText: "Start free trial",
    ctaVariant: "outline",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For solo builders and small teams running workflows in production.",
    monthlyPrice: 50,
    yearlyPrice: 50,
    yearlySavings: 0,
    features: [
      { name: "Everything in Starter, plus:", included: true },
      { name: "3 shared projects", included: true },
      { name: "20 concurrent executions", included: true },
      { name: "7 days of insights", included: true },
      { name: "Admin roles", included: true },
      { name: "Global variables", included: true },
      { name: "Workflow history", included: true },
      { name: "Execution search", included: true },
    ],
    recommended: true,
    ctaText: "Start free trial",
    ctaVariant: "default",
  },
  {
    id: "business",
    name: "Business",
    description: "For companies with < 100 employees needing collaboration and scale.",
    monthlyPrice: 667,
    yearlyPrice: 667,
    yearlySavings: 0,
    features: [
      { name: "Everything in Pro, plus:", included: true },
      { name: "6 shared projects", included: true },
      { name: "SSO, SAML and LDAP", included: true },
      { name: "30 days of insights", included: true },
      { name: "Different environments", included: true },
      { name: "Scaling options", included: true }
    ],
    ctaText: "Start free trial",
    ctaVariant: "outline",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For organisations with strict compliance and governance needs.",
    monthlyPrice: "Contact us",
    yearlyPrice: "Contact us",
    features: [
      { name: "Everything in Business, plus:", included: true },
      { name: "Unlimited shared projects", included: true },
      { name: "200+ concurrent executions", included: true },
      { name: "365 days of insights", included: true },
      { name: "External secret store integration", included: true },
      { name: "Log streaming", included: true },
      { name: "Extended data retention", included: true },
      { name: "Dedicated support with SLA", included: true },
      { name: "Invoice billing", included: true },
    ],
    ctaText: "Contact sales",
    ctaVariant: "outline",
  },
];

export function PricingCards({
  viewMode = "standalone",
  billingCycle: initialBillingCycle = "monthly",
  onBillingCycleChange,
  onPlanSelect,
  className,
}: PricingCardsProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(initialBillingCycle);

  const handleBillingToggle = (checked: boolean) => {
    const newCycle = checked ? "yearly" : "monthly";
    setBillingCycle(newCycle);
    onBillingCycleChange?.(newCycle);
  };

  const handlePlanSelect = (planId: string) => {
    onPlanSelect?.(planId);
  };

  const formatPrice = (price: number | string) => {
    if (typeof price === "string") return price;
    return `$${price} AUD`;
  };

  const getWorkflowExecutions = (planId: string) => {
    const executions = {
      starter: "2.5k workflow executions",
      pro: "10k workflow executions", 
      business: "40k workflow executions",
      enterprise: "Custom number of workflow executions"
    };
    return executions[planId as keyof typeof executions] || "";
  };

  const getYearlySavings = (plan: PricingPlan) => {
    if (plan.yearlySavings && billingCycle === "yearly") {
      return `Save $${plan.yearlySavings}`;
    }
    return null;
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Billing Toggle */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4 bg-muted p-1 rounded-md">
          <button
            onClick={() => handleBillingToggle(false)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-sm transition-colors",
              billingCycle === "monthly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => handleBillingToggle(true)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-sm transition-colors",
              billingCycle === "yearly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Yearly
            <Badge variant="destructive" className="ml-2">
            Save 20%
          </Badge>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {pricingPlans.map((plan) => {
          const isRecommended = plan.recommended;
          const yearlySavings = getYearlySavings(plan);
          const currentPrice = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative transition-all duration-200 hover:shadow-lg flex flex-col h-full",
                isRecommended && "border-primary shadow-lg"
              )}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-foreground">
                    {formatPrice(currentPrice)}
                    {typeof currentPrice === "number" && (
                      <span className="text-lg font-normal text-muted-foreground">
                        /{billingCycle === "monthly" ? "month" : "year"}
                      </span>
                    )}
                  </div>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-sm">
                      {getWorkflowExecutions(plan.id)}
                    </Badge>
                  </div>
                  {yearlySavings && (
                    <Badge variant="secondary" className="mt-2">
                      {yearlySavings}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 flex-1 flex flex-col justify-start">
                  {plan.features.map((feature, index) => {
                    const isHeader = feature.name.includes("Everything in") || feature.name.includes("This plan includes");
                    return (
                      <li key={index} className={cn(
                        "flex items-start space-x-3",
                        isHeader && "font-semibold text-foreground"
                      )}>
                        {!isHeader && (
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={cn(
                          "text-sm",
                          isHeader ? "text-foreground font-semibold" : "text-foreground"
                        )}>
                          {feature.name}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>

              <CardFooter className="pt-6 mt-auto">
                <Button
                  className="w-full"
                  variant={plan.ctaVariant || "default"}
                  size="lg"
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {plan.ctaText}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="text-center mt-8 text-sm text-muted-foreground">
        <p>All plans include 14-day free trial. No credit card required.</p>
        <p className="mt-1">
          Need a custom plan?{" "}
          <Button variant="link" className="p-0 h-auto">
            Contact our sales team
          </Button>
        </p>
      </div>
    </div>
  );
}
