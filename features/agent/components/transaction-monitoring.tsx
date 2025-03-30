import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Info } from "lucide-react"

export default function TransactionMonitoring() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Monitoring</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center">
            <Label className="text-base font-medium">Monitoring Systems</Label>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">Describe the systems you use to monitor transactions for suspicious activity</p>
              </HoverCardContent>
            </HoverCard>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">How do you monitor transactions?</Label>
            <RadioGroup defaultValue="automated">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="automated" id="automated" />
                <Label htmlFor="automated">Automated system</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual">Manual review</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hybrid" id="hybrid" />
                <Label htmlFor="hybrid">Hybrid approach</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="system-details" className="text-sm">
              Provide details about your transaction monitoring system
            </Label>
            <Textarea
              id="system-details"
              placeholder="Describe your transaction monitoring system..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <Label className="text-base font-medium">Transaction Thresholds</Label>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="threshold-amount" className="text-sm">
                Threshold transaction amount (AUD)
              </Label>
              <Input id="threshold-amount" placeholder="10,000" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-frequency" className="text-sm">
                How often are thresholds reviewed?
              </Label>
              <Select>
                <SelectTrigger id="review-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="biannually">Bi-annually</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <Label className="text-base font-medium">Alert Management</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alert-process" className="text-sm">
              Describe your process for reviewing and escalating alerts
            </Label>
            <Textarea
              id="alert-process"
              placeholder="Detail your alert management process..."
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="false-positive" className="text-sm">
                Estimated false positive rate (%)
              </Label>
              <Input id="false-positive" placeholder="e.g., 60" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alert-staff" className="text-sm">
                Number of staff handling alerts
              </Label>
              <Input id="alert-staff" placeholder="e.g., 5" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

