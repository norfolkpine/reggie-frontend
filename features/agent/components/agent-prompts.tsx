"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { FileText, Info, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

import { AgentForm } from "./types"
import { getExpectedOutputs } from '@/api/expected-outputs'
import { getInstructions } from '@/api/instructions'
import { AgentInstruction, ExpectedOutput } from '@/types/api'


interface AgentPromptsProps {
  onChange: (agentData: AgentForm) => void;
}

export default function AgentPrompts({ onChange }: AgentPromptsProps) {
 
  const [initialMessage, setInitialMessage] = useState("Hi. How can I help you?")
  const [systemMessage, setSystemMessage] = useState("")
  const [expectedOutput, setExpectedOutput] = useState("")
  const [apiOutputs, setApiOutputs] = useState<ExpectedOutput[]>([])
  const [selectedBasicTemplate, setSelectedBasicTemplate] = useState<string>("")  
  const [selectedBasicOutput, setSelectedBasicOutput] = useState<string>("")
  const [instructions, setInstructions] = useState<AgentInstruction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update system message when basic template is selected
  useEffect(() => {
    if (selectedBasicTemplate) {
      const template = instructions.find((t) => t.id.toString() === selectedBasicTemplate)
      if (template) {
        setSystemMessage(template.instruction)
      }
    }
  }, [selectedBasicTemplate, instructions])

  // Update expected output when basic output is selected
  useEffect(() => {
    if (selectedBasicOutput) {
      const output = apiOutputs.find((o) => o.id.toString() === selectedBasicOutput)
      if (output) {
        setExpectedOutput(output.expected_output)
      }
    }
  }, [selectedBasicOutput, apiOutputs])

  

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [instructionsResponse, outputsResponse] = await Promise.all([
          getInstructions(),
          getExpectedOutputs()
        ])
        setInstructions(instructionsResponse)
        setApiOutputs(outputsResponse.results)
        if (outputsResponse.results.length > 0) {
          setExpectedOutput(outputsResponse.results[0].expected_output)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        setError('Failed to load instructions and outputs')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    onChange({
      initialMessage,
      systemMessage,
      expectedOutput
    })
  }, [initialMessage, systemMessage, expectedOutput])


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Agent prompts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Initial Message - Basic Mode */}
        <div className="space-y-2">
          <div className="flex items-center">
            <label htmlFor="initial-message" className="text-sm font-medium">
              Initial user message
            </label>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">This message will be sent to the agent when a user starts a new conversation.</p>
              </HoverCardContent>
            </HoverCard>
          </div>
          <Textarea
            id="initial-message"
            className="bg-muted min-h-[80px]"
            value={initialMessage}
            onChange={(e) => setInitialMessage(e.target.value)}
          />
        </div>

        {/* System Message Section - Basic Mode */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <label htmlFor="basic-template" className="text-sm font-medium">
                Agent Instructions
              </label>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">Choose a pre-defined personality for your agent.</p>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>

          
            {instructions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {instructions.map((template) => (
                <Card
                  key={template.id}
                  className={cn(
                    "cursor-pointer hover:border-primary transition-colors",
                    selectedBasicTemplate === template.id.toString() && "border-primary bg-primary/5",
                    "border-dashed",
                  )}
                  onClick={() => {
                    setSelectedBasicTemplate(template.id.toString())
                    setSystemMessage(template.instruction)
                  }}
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base flex items-center">
                      {template.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">{template.instruction.substring(0, 100)}...</p>
                  </CardContent>
                </Card>
              ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center border rounded-lg bg-muted/50">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No instructions available</h3>
                <p className="text-sm text-muted-foreground mb-4">Instructions will appear here once they are configured.</p>
              </div>
            )}



          {selectedBasicTemplate && (
            <div className="border rounded-md p-4 bg-muted/50 mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">System Message Preview:</div>
              </div>
              <div className="text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">{systemMessage}</div>
            </div>
          )}
        </div>

        {/* Expected Output Section - Basic Mode */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <label htmlFor="basic-output" className="text-sm font-medium">
                Response Format
              </label>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <p className="text-sm">Choose how you want your agent's responses to be formatted.</p>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>

          
            {apiOutputs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apiOutputs.map((output) => (
                <Card
                  key={output.id}
                  className={cn(
                    "cursor-pointer hover:border-primary transition-colors",
                    selectedBasicOutput === output.id.toString() && "border-primary bg-primary/5"
                  )}
                  onClick={() => {
                    setSelectedBasicOutput(output.id.toString())
                    setExpectedOutput(output.expected_output)
                  }}
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base flex items-center">
                      {output.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground">{output.expected_output}</p>
                  </CardContent>
                </Card>
              ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center border rounded-lg bg-muted/50">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No response formats available</h3>
                <p className="text-sm text-muted-foreground mb-4">Response formats will appear here once they are configured.</p>
              </div>
            )}
          

          {selectedBasicOutput && (
            <div className="border rounded-md p-4 bg-muted/50 mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Format Preview:</div>
              </div>
              <div className="text-sm whitespace-pre-wrap max-h-[200px] overflow-y-auto">{expectedOutput}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

