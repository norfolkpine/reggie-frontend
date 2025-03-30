import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Info } from "lucide-react"

export default function CustomerDueDiligence() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Due Diligence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center">
            <Label className="text-base font-medium">Customer Identification Procedures</Label>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">Select all the identification methods you use to verify customer identity</p>
              </HoverCardContent>
            </HoverCard>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="id-document" />
              <Label htmlFor="id-document">Government-issued photo ID</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="electronic" />
              <Label htmlFor="electronic">Electronic verification</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="third-party" />
              <Label htmlFor="third-party">Third-party verification service</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="biometric" />
              <Label htmlFor="biometric">Biometric verification</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="other-verification" />
              <Label htmlFor="other-verification">Other verification methods</Label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <Label className="text-base font-medium">Enhanced Due Diligence</Label>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="high-risk-procedures" className="text-sm">
                Describe your enhanced due diligence procedures for high-risk customers
              </Label>
              <Textarea
                id="high-risk-procedures"
                placeholder="Detail your enhanced due diligence procedures..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edd-frequency" className="text-sm">
                How often do you review high-risk customers?
              </Label>
              <Select>
                <SelectTrigger id="edd-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
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
            <Label className="text-base font-medium">Ongoing Customer Due Diligence</Label>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">How do you maintain up-to-date customer information?</Label>
            <div className="flex items-center space-x-2">
              <Checkbox id="periodic-review" />
              <Label htmlFor="periodic-review">Periodic review of all customer information</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="transaction-trigger" />
              <Label htmlFor="transaction-trigger">Review triggered by unusual transactions</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="customer-update" />
              <Label htmlFor="customer-update">Customer self-service updates</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="automated-monitoring" />
              <Label htmlFor="automated-monitoring">Automated monitoring system</Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

