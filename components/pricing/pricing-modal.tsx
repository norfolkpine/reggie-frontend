"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PricingCards } from "./pricing-cards";
import { PricingModalProps } from "@/types/pricing";
import { cn } from "@/lib/utils";

export function PricingModal({
  open,
  onOpenChange,
  trigger,
  onPlanSelect,
  className,
}: PricingModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          "max-w-6xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-md",
          className,
        )}
      >
        <DialogHeader className="text-center space-y-2">
          <DialogTitle className="text-3xl font-bold">
            Choose your plan
          </DialogTitle>
          <DialogDescription className="text-sm">
            Pick the plan that fits your workspace. You can change or cancel
            your subscription at any time.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <PricingCards
            viewMode="modal"
            onPlanSelect={(planId) => {
              onPlanSelect?.(planId);
              onOpenChange(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
