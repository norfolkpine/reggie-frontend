"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { PricingCardsProps, PricingPlan, BillingCycle } from "@/types/pricing";
import { cn } from "@/lib/utils";

// ====== Tipe lokal untuk extend props & plan bawaan ======

type ExtendedPricingPlan = PricingPlan & {
  ctaVariant?: "default" | "outline";
};

type LocalPricingCardsProps = PricingCardsProps & {
  viewMode?: "standalone" | "modal";
  billingCycle?: BillingCycle;
};

// n8n-style pricing data (AUD currency)
const pricingPlans: ExtendedPricingPlan[] = [
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
    description:
      "For solo builders and small teams running workflows in production.",
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
    description:
      "For companies with < 100 employees needing collaboration and scale.",
    monthlyPrice: 667,
    yearlyPrice: 667,
    yearlySavings: 0,
    features: [
      { name: "Everything in Pro, plus:", included: true },
      { name: "6 shared projects", included: true },
      { name: "SSO, SAML and LDAP", included: true },
      { name: "30 days of insights", included: true },
      { name: "Different environments", included: true },
      { name: "Scaling options", included: true },
    ],
    ctaText: "Start free trial",
    ctaVariant: "outline",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description:
      "For organisations with strict compliance and governance needs.",
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

export function PricingCards(props: LocalPricingCardsProps) {
  const {
    viewMode = "standalone",
    billingCycle: initialBillingCycle = "monthly",
    onBillingCycleChange,
    onPlanSelect,
    className,
  } = props;

  const [billingCycle, setBillingCycle] =
    useState<BillingCycle>(initialBillingCycle);

  const handleBillingToggle = (checked: boolean) => {
    const newCycle: BillingCycle = checked ? "yearly" : "monthly";
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
      enterprise: "Custom number of workflow executions",
    };
    return executions[planId as keyof typeof executions] || "";
  };

  const getYearlySavings = (plan: ExtendedPricingPlan) => {
    if (plan.yearlySavings && billingCycle === "yearly") {
      return `Save $${plan.yearlySavings}`;
    }
    return null;
  };

  const wrapperClasses = cn(
    "w-full",
    viewMode === "standalone" && "max-w-7xl mx-auto",
    className,
  );

  return (
    <div className={wrapperClasses}>
      {/* Billing Toggle */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4 bg-muted p-1 rounded-full shadow-sm">
          <button
            onClick={() => handleBillingToggle(false)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
              billingCycle === "monthly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => handleBillingToggle(true)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-full transition-colors inline-flex items-center gap-1",
              billingCycle === "yearly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Yearly
            <Badge variant="destructive" className="ml-1 text-[11px]">
              Save 20%
            </Badge>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div
        className={cn(
          "grid grid-cols-1 gap-6",
          "md:grid-cols-2 lg:grid-cols-4",
        )}
      >
        {pricingPlans.map((plan) => {
          const isRecommended = plan.recommended;
          const yearlySavings = getYearlySavings(plan);
          const currentPrice =
            billingCycle === "monthly"
              ? plan.monthlyPrice
              : plan.yearlyPrice;

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative flex h-full flex-col border border-border/70 bg-background/95 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl",
                isRecommended &&
                  "border-primary/70 shadow-[0_18px_45px_rgba(0,0,0,0.25)]",
              )}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 transform">
                  <Badge className="bg-primary text-primary-foreground px-3 py-0.5 text-xs rounded-full">
                    Most popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4 text-center">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {plan.description}
                </CardDescription>
                <div className="mt-4 space-y-2">
                  <div className="text-2xl font-bold text-foreground">
                    {formatPrice(currentPrice)}
                    {typeof currentPrice === "number" && (
                      <span className="ml-1 text-lg font-normal text-muted-foreground">
                        /{billingCycle === "monthly" ? "month" : "year"}
                      </span>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {getWorkflowExecutions(plan.id)}
                  </Badge>
                  {yearlySavings && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/40"
                    >
                      {yearlySavings}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col">
                <ul className="flex flex-1 flex-col justify-start space-y-3">
                  {plan.features.map((feature, index) => {
                    const isHeader =
                      feature.name.includes("Everything in") ||
                      feature.name.includes("This plan includes");
                    return (
                      <li
                        key={index}
                        className={cn(
                          "flex items-start space-x-3 text-sm",
                          isHeader && "font-semibold text-foreground",
                        )}
                      >
                        {!isHeader && (
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        )}
                        <span
                          className={cn(
                            isHeader
                              ? "text-foreground font-semibold"
                              : "text-foreground",
                          )}
                        >
                          {feature.name}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>

              <CardFooter className="mt-auto pt-6">
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
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>All plans include 14-day free trial. No credit card required.</p>
        <p className="mt-1">
          Need a custom plan?{" "}
          <Button variant="link" className="h-auto p-0 text-sm">
            Contact our sales team
          </Button>
        </p>
      </div>
    </div>
  );
}
