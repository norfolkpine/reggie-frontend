"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter as DialogFooterUI,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

type InvoiceRow = {
  date: string;
  description: string;
  amount: string;
};

type DownloadOptions = {
  deliveryMethod: "download" | "email";
  email: string;
  includeUsage: boolean;
  includeTax: boolean;
  invoice: InvoiceRow;
};

type BillingHistoryCardProps = {
  className?: string;
  /** Optional: override invoices dari backend nanti */
  invoices?: InvoiceRow[];
  /** Optional: hook ke backend ketika user klik "Download" / "Send" */
  onDownload?: (options: DownloadOptions) => void | Promise<void>;
};

const DEFAULT_INVOICES: InvoiceRow[] = [
  { date: "2025-05-01", description: "Pro plan – monthly", amount: "$20.00" },
  { date: "2025-04-01", description: "Pro plan – monthly", amount: "$20.00" },
  { date: "2025-03-01", description: "Pro plan – monthly", amount: "$20.00" },
];

export function BillingHistoryCard({
  className,
  invoices = DEFAULT_INVOICES,
  onDownload,
}: BillingHistoryCardProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deliveryMethod, setDeliveryMethod] =
    React.useState<"download" | "email">("download");
  const [email, setEmail] = React.useState("");
  const [includeUsage, setIncludeUsage] = React.useState(true);
  const [includeTax, setIncludeTax] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const latestInvoice = invoices[0];

  const handleConfirm = async () => {
    if (!latestInvoice) {
      setDialogOpen(false);
      return;
    }

    const options: DownloadOptions = {
      deliveryMethod,
      email,
      includeUsage,
      includeTax,
      invoice: latestInvoice,
    };

    try {
      setIsSubmitting(true);

      if (onDownload) {
        // nanti: panggil API backend di sini dari parent, kalau mau
        await onDownload(options);
      } else {
        // sementara: hanya log ke console sebagai placeholder
        console.log("Download latest invoice with options:", options);

        // contoh pseudo-code nanti:
        // if (deliveryMethod === "download") {
        //   window.open(`/api/billing/invoices/latest/pdf?...`, "_blank");
        // } else {
        //   await fetch("/api/billing/invoices/email-latest", { method: "POST", body: JSON.stringify(options) });
        // }
      }

      setDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className={cn("h-full", className)}>
        <CardHeader className="pb-3">
          <CardTitle>Billing history</CardTitle>
          <CardDescription>
            Previous invoices for this workspace.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="overflow-hidden rounded-md border bg-background">
            <table className="w-full text-sm">
              <thead className="bg-muted/70">
                <tr className="text-left">
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Description</th>
                  <th className="px-4 py-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.date + invoice.description}
                    className="border-t"
                  >
                    <td className="px-4 py-2">{invoice.date}</td>
                    <td className="px-4 py-2">{invoice.description}</td>
                    <td className="px-4 py-2 text-right font-medium">
                      {invoice.amount}
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr className="border-t">
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-xs text-muted-foreground"
                    >
                      No invoices yet. Your billing history will appear here
                      after your first charge.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>

        <CardFooter className="pt-4">
          <Button
            variant="outline"
            className="w-full justify-center gap-2"
            onClick={() => setDialogOpen(true)}
            disabled={!latestInvoice}
          >
            <Download className="h-4 w-4" />
            Download latest invoice
          </Button>
        </CardFooter>
      </Card>

      {/* Dialog konfirmasi download */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Download latest invoice</DialogTitle>
            {latestInvoice && (
              <DialogDescription>
                You’re about to download the most recent invoice for this
                workspace:
                <br />
                <span className="font-medium">
                  {latestInvoice.date} — {latestInvoice.description} (
                  {latestInvoice.amount})
                </span>
              </DialogDescription>
            )}
          </DialogHeader>

          {latestInvoice && (
            <div className="space-y-4 pt-2">
              {/* Delivery method */}
              <div className="space-y-2">
                <Label className="text-sm">
                  How do you want to receive it?
                </Label>
                <RadioGroup
                  value={deliveryMethod}
                  onValueChange={(val) =>
                    setDeliveryMethod(val as "download" | "email")
                  }
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  <Label
                    htmlFor="delivery-download"
                    className="flex cursor-pointer items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm hover:bg-muted"
                  >
                    <RadioGroupItem
                      id="delivery-download"
                      value="download"
                    />
                    Download as PDF
                  </Label>

                  <Label
                    htmlFor="delivery-email"
                    className="flex cursor-pointer items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm hover:bg-muted"
                  >
                    <RadioGroupItem id="delivery-email" value="email" />
                    Email a copy
                  </Label>
                </RadioGroup>
              </div>

              {/* Email field (optional) */}
              {deliveryMethod === "email" && (
                <div className="space-y-1">
                  <Label htmlFor="invoice-email" className="text-sm">
                    Send invoice to
                  </Label>
                  <Input
                    id="invoice-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    We’ll email the PDF invoice to this address.
                  </p>
                </div>
              )}

              {/* Extra options */}
              <div className="space-y-2">
                <Label className="text-sm">Include details</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={includeUsage}
                      onCheckedChange={(val) =>
                        setIncludeUsage(Boolean(val))
                      }
                    />
                    <span>Usage breakdown for this billing period</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={includeTax}
                      onCheckedChange={(val) =>
                        setIncludeTax(Boolean(val))
                      }
                    />
                    <span>Tax details and company information</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <DialogFooterUI className="mt-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              type="button"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={
                isSubmitting ||
                !latestInvoice ||
                (deliveryMethod === "email" && !email)
              }
            >
              {deliveryMethod === "download"
                ? isSubmitting
                  ? "Preparing PDF..."
                  : "Download PDF"
                : isSubmitting
                ? "Sending..."
                : "Send invoice"}
            </Button>
          </DialogFooterUI>
        </DialogContent>
      </Dialog>
    </>
  );
}
