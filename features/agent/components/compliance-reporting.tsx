import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Info } from "lucide-react"

export default function ComplianceReporting() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Reporting</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center">
            <Label className="text-base font-medium">Suspicious Matter Reports (SMRs)</Label>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">
                  Information about your process for submitting Suspicious Matter Reports to AUSTRAC
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Have you submitted any SMRs in the past 12 months?</Label>
            <RadioGroup defaultValue="yes">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="smr-yes" />
                <Label htmlFor="smr-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="smr-no" />
                <Label htmlFor="smr-no">No</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="smr-process" className="text-sm">
              Describe your process for identifying and reporting suspicious matters
            </Label>
            <Textarea id="smr-process" placeholder="Detail your SMR process..." className="min-h-[100px]" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <Label className="text-base font-medium">Threshold Transaction Reports (TTRs)</Label>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">How do you submit TTRs to AUSTRAC?</Label>
            <RadioGroup defaultValue="api">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="api" id="ttr-api" />
                <Label htmlFor="ttr-api">Direct API integration</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="portal" id="ttr-portal" />
                <Label htmlFor="ttr-portal">AUSTRAC Online Portal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="batch" id="ttr-batch" />
                <Label htmlFor="ttr-batch">Batch file upload</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="ttr-manual" />
                <Label htmlFor="ttr-manual">Manual entry</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ttr-volume" className="text-sm">
                Estimated monthly TTR volume
              </Label>
              <Input id="ttr-volume" placeholder="e.g., 50" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <Label className="text-base font-medium">Compliance Program Review</Label>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">How often is your AML/CTF program reviewed?</Label>
            <RadioGroup defaultValue="annually">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quarterly" id="review-quarterly" />
                <Label htmlFor="review-quarterly">Quarterly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="biannually" id="review-biannually" />
                <Label htmlFor="review-biannually">Bi-annually</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="annually" id="review-annually" />
                <Label htmlFor="review-annually">Annually</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="biennially" id="review-biennially" />
                <Label htmlFor="review-biennially">Every two years</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="last-review" className="text-sm">
              Date of last AML/CTF program review
            </Label>
            <Input id="last-review" type="date" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-findings" className="text-sm">
              Summary of key findings from last review
            </Label>
            <Textarea id="review-findings" placeholder="Summarize key findings..." className="min-h-[100px]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

