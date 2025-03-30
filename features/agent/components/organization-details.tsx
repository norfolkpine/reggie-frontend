import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Info } from "lucide-react"

export default function OrganizationDetails() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="org-name" className="text-sm font-medium">
                Organization Name
              </Label>
            </div>
            <Input id="org-name" placeholder="Enter your organization's legal name" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="abn" className="text-sm font-medium">
                ABN/ACN
              </Label>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">Australian Business Number or Australian Company Number</p>
                </HoverCardContent>
              </HoverCard>
            </div>
            <Input id="abn" placeholder="XX XXX XXX XXX" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="business-type" className="text-sm font-medium">
                Business Type
              </Label>
            </div>
            <Select>
              <SelectTrigger id="business-type">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="banking">Banking</SelectItem>
                <SelectItem value="remittance">Remittance Service</SelectItem>
                <SelectItem value="gambling">Gambling</SelectItem>
                <SelectItem value="digital-currency">Digital Currency Exchange</SelectItem>
                <SelectItem value="financial">Financial Services</SelectItem>
                <SelectItem value="bullion">Bullion Dealer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="austrac-id" className="text-sm font-medium">
                AUSTRAC Registration ID
              </Label>
            </div>
            <Input id="austrac-id" placeholder="Enter your AUSTRAC ID" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="address" className="text-sm font-medium">
              Registered Business Address
            </Label>
          </div>
          <Textarea id="address" placeholder="Enter your registered business address" className="min-h-[80px]" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="compliance-officer" className="text-sm font-medium">
              AML/CTF Compliance Officer
            </Label>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">The person responsible for your organization's AML/CTF program</p>
              </HoverCardContent>
            </HoverCard>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input id="compliance-officer" placeholder="Full Name" />
            <Input id="compliance-email" type="email" placeholder="Email Address" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

