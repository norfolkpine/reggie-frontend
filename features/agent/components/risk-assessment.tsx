import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Info } from "lucide-react"
import { Slider } from "@/components/ui/slider"

export default function RiskAssessment() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center">
            <Label className="text-base font-medium">Customer Risk Profile</Label>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">Assess the overall risk level of your customer base</p>
              </HoverCardContent>
            </HoverCard>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm">Do you have customers who are politically exposed persons (PEPs)?</Label>
              <RadioGroup defaultValue="no">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="pep-yes" />
                  <Label htmlFor="pep-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="pep-no" />
                  <Label htmlFor="pep-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Do you have customers from high-risk countries?</Label>
              <RadioGroup defaultValue="no">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="high-risk-yes" />
                  <Label htmlFor="high-risk-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="high-risk-no" />
                  <Label htmlFor="high-risk-no">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <Label className="text-base font-medium">Product & Service Risk</Label>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm">Rate the ML/TF risk level of your products and services</Label>
              <div className="flex items-center space-x-4">
                <Slider defaultValue={[2]} max={5} step={1} className="w-full" />
                <span className="text-sm font-medium min-w-[80px] text-center">Medium</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-justification" className="text-sm">
                Justify your product risk rating
              </Label>
              <Textarea
                id="product-justification"
                placeholder="Explain why you've selected this risk level..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <Label className="text-base font-medium">Delivery Channel Risk</Label>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">How do you primarily deliver your services?</Label>
            <RadioGroup defaultValue="face-to-face">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="face-to-face" id="face-to-face" />
                <Label htmlFor="face-to-face">Face-to-face</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online">Online/Digital</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="third-party" id="third-party" />
                <Label htmlFor="third-party">Through third-party agents</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mixed" id="mixed" />
                <Label htmlFor="mixed">Mixed channels</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

