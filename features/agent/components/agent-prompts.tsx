"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Info, Sparkles, Server } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// Instruction categories from Django models
const INSTRUCTION_CATEGORIES = {
  SCOPE: "Scope & Knowledge Boundaries",
  RETRIEVAL: "Information Retrieval & Accuracy",
  RESPONSE_FORMATTING: "Response Handling & Formatting",
  COMPLIANCE: "Compliance-Specific Instructions",
  PERSONALITY: "Personality",
  PROCESS: "Process",
  IMPROVEMENT: "Improvement",
}

// Sample instruction templates based on Django categories
const instructionTemplates = [
  {
    id: "1",
    name: "AUSTRAC Compliance Expert",
    description: "Specialized in AML/CTF regulations and compliance",
    category: INSTRUCTION_CATEGORIES.COMPLIANCE,
    is_global: true,
    is_enabled: true,
    instruction:
      "Act as an AUSTRAC compliance expert with deep knowledge of Australian AML/CTF regulations. Provide detailed guidance on regulatory requirements, reporting obligations, and compliance best practices. When asked about specific regulations, cite the relevant sections of the AML/CTF Act or Rules.",
  },
  {
    id: "2",
    name: "Financial Crime Analyst",
    description: "Focused on detecting suspicious activities and patterns",
    category: INSTRUCTION_CATEGORIES.COMPLIANCE,
    is_global: true,
    is_enabled: true,
    instruction:
      "Act as a financial crime analyst specializing in detecting suspicious patterns and activities. Help users identify potential money laundering, terrorism financing, and fraud indicators. Provide guidance on transaction monitoring, red flags, and investigation procedures.",
  },
  {
    id: "3",
    name: "KYC/CDD Specialist",
    description: "Expert in customer due diligence procedures",
    category: INSTRUCTION_CATEGORIES.COMPLIANCE,
    is_global: true,
    is_enabled: true,
    instruction:
      "Act as a Know Your Customer (KYC) and Customer Due Diligence (CDD) specialist. Provide guidance on customer identification, verification procedures, ongoing monitoring, and enhanced due diligence for high-risk customers. Help users implement effective KYC/CDD programs.",
  },
  {
    id: "4",
    name: "Regulatory Reporting Advisor",
    description: "Specialized in AUSTRAC reporting requirements",
    category: INSTRUCTION_CATEGORIES.COMPLIANCE,
    is_global: false,
    is_enabled: true,
    instruction:
      "Act as a regulatory reporting advisor specializing in AUSTRAC reporting requirements. Provide guidance on threshold transaction reports (TTRs), suspicious matter reports (SMRs), and international funds transfer instructions (IFTIs). Help users understand reporting timeframes, data requirements, and submission procedures.",
  },
  {
    id: "5",
    name: "Compliance Program Developer",
    description: "Helps design AML/CTF compliance programs",
    category: INSTRUCTION_CATEGORIES.PROCESS,
    is_global: false,
    is_enabled: true,
    instruction:
      "Act as a compliance program developer specializing in AML/CTF programs. Help users design, implement, and maintain effective compliance programs that meet AUSTRAC requirements. Provide guidance on risk assessments, policy development, procedures, training, and independent reviews.",
  },
  {
    id: "6",
    name: "Risk Assessment Specialist",
    description: "Expert in ML/TF risk assessment methodologies",
    category: INSTRUCTION_CATEGORIES.PROCESS,
    is_global: false,
    is_enabled: true,
    instruction:
      "Act as a risk assessment specialist focusing on money laundering and terrorism financing risks. Help users identify, assess, and mitigate ML/TF risks in their business operations, products, services, and customer base. Provide guidance on risk assessment methodologies and documentation.",
  },
  {
    id: "7",
    name: "Sanctions Compliance Advisor",
    description: "Specialized in sanctions screening and compliance",
    category: INSTRUCTION_CATEGORIES.COMPLIANCE,
    is_global: false,
    is_enabled: false,
    instruction:
      "Act as a sanctions compliance advisor with expertise in Australian and international sanctions regimes. Provide guidance on sanctions screening procedures, list management, false positive handling, and sanctions risk assessment. Help users implement effective sanctions compliance programs.",
  },
  {
    id: "8",
    name: "Transaction Monitoring Expert",
    description: "Focused on transaction monitoring systems and rules",
    category: INSTRUCTION_CATEGORIES.RETRIEVAL,
    is_global: true,
    is_enabled: true,
    instruction:
      "Act as a transaction monitoring expert specializing in detecting suspicious financial activities. Provide guidance on designing effective monitoring scenarios, thresholds, and alert management processes. Help users optimize their transaction monitoring systems to detect potential money laundering and terrorism financing.",
  },
  {
    id: "9",
    name: "Formal Response Structure",
    description: "Provides structured, formal responses",
    category: INSTRUCTION_CATEGORIES.RESPONSE_FORMATTING,
    is_global: true,
    is_enabled: true,
    instruction:
      "Structure your responses in a formal, professional manner with clear sections. Begin with a concise summary, followed by detailed analysis, and end with actionable recommendations when appropriate.",
  },
  {
    id: "10",
    name: "Knowledge Boundary Setting",
    description: "Defines what the agent should know",
    category: INSTRUCTION_CATEGORIES.SCOPE,
    is_global: true,
    is_enabled: true,
    instruction:
      "You are an expert in Australian financial regulations, particularly AML/CTF requirements. Your knowledge is limited to regulatory frameworks, compliance procedures, and best practices. Do not provide legal advice or make specific business decisions.",
  },
  {
    id: "11",
    name: "Helpful & Professional Tone",
    description: "Sets a professional personality",
    category: INSTRUCTION_CATEGORIES.PERSONALITY,
    is_global: true,
    is_enabled: true,
    instruction:
      "Maintain a helpful, professional tone in all interactions. Be thorough but concise, and avoid using overly technical language unless necessary. When explaining complex concepts, use clear examples to illustrate your points.",
  },
  {
    id: "12",
    name: "Continuous Improvement Focus",
    description: "Emphasizes learning and improvement",
    category: INSTRUCTION_CATEGORIES.IMPROVEMENT,
    is_global: false,
    is_enabled: true,
    instruction:
      "Suggest ways to improve compliance processes when appropriate. Highlight areas where automation, better documentation, or enhanced training might strengthen compliance programs.",
  },
]

// Pre-configured template sets for common use cases
const templateLibrary = [
  {
    id: "aml-basic",
    name: "AML/CTF Basic Compliance",
    description: "Standard instructions for basic AML/CTF compliance requirements",
    category: "Compliance",
    instructions: ["1", "3", "4", "10"],
  },
  {
    id: "aml-advanced",
    name: "AML/CTF Advanced Compliance",
    description: "Comprehensive instructions for advanced AML/CTF compliance",
    category: "Compliance",
    instructions: ["1", "2", "3", "4", "5", "6", "10", "11"],
  },
  {
    id: "kyc-focused",
    name: "KYC/CDD Specialist",
    description: "Focused on customer due diligence procedures",
    category: "Customer Verification",
    instructions: ["3", "10", "11", "12"],
  },
  {
    id: "transaction-monitoring",
    name: "Transaction Monitoring",
    description: "Specialized in detecting suspicious transactions",
    category: "Monitoring",
    instructions: ["2", "8", "9", "11"],
  },
  {
    id: "reporting-specialist",
    name: "Regulatory Reporting",
    description: "Focused on AUSTRAC reporting requirements",
    category: "Reporting",
    instructions: ["4", "9", "10", "11"],
  },
  {
    id: "formal-advisor",
    name: "Formal Compliance Advisor",
    description: "Professional tone with structured responses",
    category: "Advisory",
    instructions: ["1", "9", "10", "11"],
  },
]

// Basic template options for simplified view
const basicTemplateOptions = [
  {
    id: "compliance-expert",
    name: "Compliance Expert",
    description: "Expert in regulatory compliance with formal responses",
    systemMessage: `Act as a compliance expert with deep knowledge of regulations. Provide detailed guidance on regulatory requirements, reporting obligations, and compliance best practices.

RULES:
- Structure your responses in a formal, professional manner with clear sections
- Begin with a concise summary, followed by detailed analysis
- End with actionable recommendations when appropriate
- Maintain a helpful, professional tone in all interactions
- Be thorough but concise, and avoid using overly technical language unless necessary
- When explaining complex concepts, use clear examples to illustrate your points`,
  },
  {
    id: "financial-advisor",
    name: "Financial Advisor",
    description: "Provides financial guidance and recommendations",
    systemMessage: `Act as a financial advisor who helps clients understand financial concepts and make informed decisions.

RULES:
- Explain financial concepts in clear, accessible language
- Provide balanced perspectives on financial decisions
- Never recommend specific investments or make promises about returns
- Always emphasize the importance of personal research and professional advice
- Maintain a friendly, approachable tone
- Use examples to illustrate complex financial concepts`,
  },
  {
    id: "educational-tutor",
    name: "Educational Tutor",
    description: "Helps users learn and understand complex topics",
    systemMessage: `Act as an expert teacher who helps students learn and understand complex topics.

RULES:
- Never just give the answer, guide the student to understanding
- Be encouraging and supportive
- Never make things up or provide incorrect information
- Keep responses clear and concise
- Use the Socratic method when appropriate to encourage critical thinking
- Provide examples and analogies to help explain difficult concepts`,
  },
  {
    id: "technical-assistant",
    name: "Technical Assistant",
    description: "Provides technical support and guidance",
    systemMessage: `Act as a technical assistant who helps users solve technical problems and understand technical concepts.

RULES:
- Provide step-by-step instructions for technical tasks
- Explain technical concepts in accessible language
- Suggest troubleshooting steps for technical issues
- Recommend best practices for technical implementations
- Be patient and thorough in explanations
- Ask clarifying questions when necessary to provide accurate assistance`,
  },
  {
    id: "custom",
    name: "Custom",
    description: "Create your own custom agent personality",
    systemMessage: "",
  },
]

// Basic output format options
const basicOutputOptions = [
  {
    id: "structured-report",
    name: "Structured Report",
    description: "Formal report with clear sections and recommendations",
    output: `# {Report Title}

## Executive Summary
{Brief overview of key points}

## Background
{Context and relevant information}

## Analysis
{Detailed examination of the topic}
{Supporting evidence and reasoning}

## Recommendations
{Clear, actionable recommendations}
{Priority levels if applicable}

## Next Steps
{Suggested follow-up actions}

---
Report generated: {current_date}`,
  },
  {
    id: "conversational",
    name: "Conversational",
    description: "Natural, dialogue-style responses",
    output: `I'll respond in a natural, conversational style that's easy to read and understand. I'll use:

- Simple, clear language
- Short paragraphs
- Occasional questions to check understanding
- Friendly tone throughout
- Examples when helpful
- Bullet points for lists
- Bold text for important points`,
  },
  {
    id: "step-by-step",
    name: "Step-by-Step Guide",
    description: "Clear instructions in numbered steps",
    output: `# {Guide Title}

## Overview
{Brief explanation of what this guide covers}

## Prerequisites
{What you need before starting}

## Steps

1. **First Step**: {Detailed explanation}
   - {Additional notes if needed}
   - {Tips or warnings}

2. **Second Step**: {Detailed explanation}
   - {Additional notes if needed}
   - {Tips or warnings}

3. **Third Step**: {Detailed explanation}
   - {Additional notes if needed}
   - {Tips or warnings}

## Troubleshooting
{Common issues and solutions}

## Additional Resources
{Links or references for more information}`,
  },
  {
    id: "q-and-a",
    name: "Q&A Format",
    description: "Question and answer format for clear explanations",
    output: `# {Topic} FAQ

## Q: {Common question about the topic}?
A: {Clear, concise answer}
- {Additional context if needed}
- {Examples if helpful}

## Q: {Another common question}?
A: {Clear, concise answer}
- {Additional context if needed}
- {Examples if helpful}

## Q: {Another common question}?
A: {Clear, concise answer}
- {Additional context if needed}
- {Examples if helpful}

## Additional Resources
{Where to find more information}`,
  },
  {
    id: "custom",
    name: "Custom",
    description: "Create your own custom response format",
    output: "",
  },
]

// Expected output templates
const outputTemplates = [
  {
    id: "1",
    name: "Formal Compliance Report",
    description: "Structured report format for compliance findings",
    category: "Compliance",
    is_global: true,
    is_enabled: true,
    output: `# Compliance Assessment Report

## Executive Summary
{Brief overview of key findings and compliance status}

## Regulatory Context
{Relevant regulations and requirements}

## Assessment Findings
{Detailed analysis of compliance status}
{Areas of strength}
{Areas requiring attention}

## Recommendations
{Specific actionable recommendations}
{Priority levels and timelines}

## Next Steps
{Implementation guidance}
{Follow-up procedures}

---
Report generated: {current_date}`,
  },
  {
    id: "2",
    name: "Risk Analysis Template",
    description: "Format for risk assessment and analysis",
    category: "Risk Assessment",
    is_global: true,
    is_enabled: true,
    output: `# Risk Assessment Report

## Risk Profile Summary
{Overall risk rating and key indicators}

## Identified Risk Factors
{Detailed breakdown of risk categories}
{Likelihood and impact assessments}

## Control Effectiveness
{Evaluation of existing controls}
{Control gaps identified}

## Mitigation Strategies
{Recommended risk mitigation measures}
{Implementation priorities}

## Monitoring Requirements
{Ongoing monitoring procedures}
{Key risk indicators to track}

---
Assessment date: {current_date}`,
  },
  {
    id: "3",
    name: "Transaction Analysis Report",
    description: "Format for suspicious transaction analysis",
    category: "Transaction Monitoring",
    is_global: true,
    is_enabled: true,
    output: `# Transaction Analysis Report

## Alert Summary
{Alert type and triggering conditions}
{Transaction details and parties involved}

## Pattern Analysis
{Transaction patterns identified}
{Comparison to expected behavior}
{Red flags and indicators}

## Customer Context
{Customer profile and history}
{Related party information}

## Determination
{Analysis conclusion}
{Suspicious activity assessment}
{Regulatory implications}

## Recommended Actions
{Reporting requirements}
{Additional investigation steps}
{Account handling guidance}

---
Analysis completed: {current_date}`,
  },
  {
    id: "4",
    name: "Regulatory Advisory Notice",
    description: "Format for providing regulatory guidance",
    category: "Advisory",
    is_global: true,
    is_enabled: true,
    output: `# Regulatory Advisory Notice

## Regulatory Update
{Regulation name and effective date}
{Issuing authority}

## Key Requirements
{Summary of main obligations}
{Compliance deadlines}

## Impact Assessment
{Business impact analysis}
{Operational considerations}

## Implementation Guidance
{Step-by-step compliance approach}
{Resource requirements}

## Reference Materials
{Links to official documentation}
{Relevant guidance and interpretations}

---
Advisory issued: {current_date}`,
  },
  {
    id: "5",
    name: "Training Material Format",
    description: "Structure for compliance training content",
    category: "Training",
    is_global: false,
    is_enabled: true,
    output: `# Compliance Training Module

## Learning Objectives
{Key learning outcomes}
{Compliance requirements addressed}

## Regulatory Background
{Relevant regulations explained}
{Purpose and intent of requirements}

## Practical Application
{Real-world examples and scenarios}
{Common compliance challenges}

## Best Practices
{Recommended procedures}
{Warning signs and red flags}

## Knowledge Check
{Key questions to test understanding}
{Scenario-based assessment}

## Additional Resources
{Reference materials}
{Contact information for questions}

---
Training material prepared: {current_date}`,
  },
  {
    id: "6",
    name: "Investigative Report",
    description: "Format for compliance investigations",
    category: "Investigation",
    is_global: false,
    is_enabled: false,
    output: `# Compliance Investigation Report

## Case Summary
{Investigation scope and trigger}
{Parties involved}

## Methodology
{Investigation approach}
{Information sources}
{Limitations}

## Factual Findings
{Chronology of events}
{Documentary evidence}
{Interview summaries}

## Analysis
{Regulatory requirements assessment}
{Policy violations identified}
{Root cause analysis}

## Conclusions
{Determination of compliance status}
{Severity assessment}

## Recommendations
{Remedial actions}
{Preventive measures}
{Reporting obligations}

---
Investigation completed: {current_date}`,
  },
]

// Pre-configured output template sets
const outputLibrary = [
  {
    id: "compliance-basic",
    name: "Basic Compliance Reporting",
    description: "Essential formats for compliance documentation",
    category: "Compliance",
    outputs: ["1", "2", "4"],
  },
  {
    id: "compliance-advanced",
    name: "Advanced Compliance Suite",
    description: "Comprehensive reporting formats for compliance professionals",
    category: "Compliance",
    outputs: ["1", "2", "3", "4", "5"],
  },
  {
    id: "risk-focused",
    name: "Risk Management Package",
    description: "Formats focused on risk assessment and management",
    category: "Risk",
    outputs: ["2", "3"],
  },
  {
    id: "transaction-monitoring",
    name: "Transaction Analysis Suite",
    description: "Formats for transaction monitoring and investigation",
    category: "Monitoring",
    outputs: ["3", "6"],
  },
  {
    id: "advisory-package",
    name: "Regulatory Advisory Package",
    description: "Formats for providing regulatory guidance",
    category: "Advisory",
    outputs: ["1", "4", "5"],
  },
]

// Add state for custom inputs
export default function AgentPrompts() {
  // Add API endpoint comment for system message and output format
  // When updating the system message (instructions), use:
  // POST /api/agents/:id/instructions/ with the instruction data

  // When updating the expected output format, use:
  // POST /api/agents/:id/expected-output/ with the output format data

  const [instructionMode, setInstructionMode] = useState<"type" | "select" | "library">("type")
  const [outputMode, setOutputMode] = useState<"type" | "select" | "library">("type")
  const [initialMessage, setInitialMessage] = useState("Hi. How can I help you?")

  const [systemMessage, setSystemMessage] =
    useState(`Act as an expert teacher who helps students learn how to study at university level.

RULES:
Never just give the answer.
Be encouraging.
Never makes things up.
Keep responses to less than 200 words.
Don't say that different people have preferred learning styles.
Don't reference the resources`)

  const [expectedOutput, setExpectedOutput] = useState(`# {Compelling Headline} 📰

## Executive Summary
{Concise overview of key findings and significance}

## Background & Context
{Historical context and importance}
{Current landscape overview}

## Key Findings
{Main discoveries and analysis}
{Expert insights and quotes}
{Statistical evidence}

## Impact Analysis
{Current implications}
{Stakeholder perspectives}
{Industry/societal effects}

## Future Outlook
{Emerging trends}
{Expert predictions}
{Potential challenges and opportunities}

## Expert Insights
{Notable quotes and analysis from industry leaders}
{Contrasting viewpoints}

## Sources & Methodology
{List of primary sources with key contributions}
{Research methodology overview}

---
Research conducted by AI Investigative Journalist
New York Times Style Report
Published: {current_date}
Last Updated: {current_time}`)

  const [customSystemMessage, setCustomSystemMessage] = useState("")
  const [customOutputFormat, setCustomOutputFormat] = useState("")
  const [selectedBasicTemplate, setSelectedBasicTemplate] = useState<string>("")
  const [selectedBasicOutput, setSelectedBasicOutput] = useState<string>("")

  // Example of how you would fetch instruction templates from the server
  // useEffect(() => {
  //   const fetchInstructionTemplates = async () => {
  //     try {
  //       const response = await fetch('/api/agent-instructions/');
  //       const data = await response.json();
  //       // Process and set instruction templates
  //     } catch (error) {
  //       console.error("Error fetching instruction templates:", error);
  //     }
  //   };
  //
  //   fetchInstructionTemplates();
  // }, []);

  // Example of how you would fetch output templates from the server
  // useEffect(() => {
  //   const fetchOutputTemplates = async () => {
  //     try {
  //       const response = await fetch('/api/agent-outputs/');
  //       const data = await response.json();
  //       // Process and set output templates
  //     } catch (error) {
  //       console.error("Error fetching output templates:", error);
  //     }
  //   };
  //
  //   fetchOutputTemplates();
  // }, []);

  const [searchQuery, setSearchQuery] = useState("")
  const [outputSearchQuery, setOutputSearchQuery] = useState("")

  const [selectedInstructions, setSelectedInstructions] = useState<string[]>([])
  const [selectedOutputs, setSelectedOutputs] = useState<string[]>([])

  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [outputCategoryFilter, setOutputCategoryFilter] = useState<string>("all")

  const [showGlobalOnly, setShowGlobalOnly] = useState<boolean>(false)
  const [showOutputGlobalOnly, setShowOutputGlobalOnly] = useState<boolean>(false)

  const [showEnabledOnly, setShowEnabledOnly] = useState<boolean>(true)
  const [showOutputEnabledOnly, setShowOutputEnabledOnly] = useState<boolean>(true)

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
  const [selectedOutputTemplateId, setSelectedOutputTemplateId] = useState<string>("")

  // Basic mode selections
  // const [selectedBasicTemplate, setSelectedBasicTemplate] = useState<string>("") // Duplicated
  // const [selectedBasicOutput, setSelectedBasicOutput] = useState<string>("") // Duplicated

  // Filter templates based on search query and filters
  const filteredTemplates = instructionTemplates.filter((template) => {
    // Text search
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())

    // Category filter
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter

    // Global filter
    const matchesGlobal = !showGlobalOnly || template.is_global

    // Enabled filter
    const matchesEnabled = !showEnabledOnly || template.is_enabled

    return matchesSearch && matchesCategory && matchesGlobal && matchesEnabled
  })

  // Filter output templates
  const filteredOutputs = outputTemplates.filter((template) => {
    // Text search
    const matchesSearch =
      template.name.toLowerCase().includes(outputSearchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(outputSearchQuery.toLowerCase())

    // Category filter
    const matchesCategory = outputCategoryFilter === "all" || template.category === outputCategoryFilter

    // Global filter
    const matchesGlobal = !showOutputGlobalOnly || template.is_global

    // Enabled filter
    const matchesEnabled = !showOutputEnabledOnly || template.is_enabled

    return matchesSearch && matchesCategory && matchesGlobal && matchesEnabled
  })

  // Update system message when selections change
  useEffect(() => {
    if ((instructionMode === "select" || instructionMode === "library") && selectedInstructions.length > 0) {
      const selectedTemplates = instructionTemplates.filter((t) => selectedInstructions.includes(t.id))

      // Group instructions by category
      const categorizedInstructions: Record<string, string[]> = {}

      selectedTemplates.forEach((template) => {
        if (!categorizedInstructions[template.category]) {
          categorizedInstructions[template.category] = []
        }
        categorizedInstructions[template.category].push(template.instruction)
      })

      // Build the system message with category headers
      let newMessage = ""

      Object.entries(categorizedInstructions).forEach(([category, instructions]) => {
        newMessage += `## ${category}\n\n`
        newMessage += instructions.join("\n\n")
        newMessage += "\n\n"
      })

      setSystemMessage(newMessage.trim())
    }
  }, [selectedInstructions, instructionMode])

  // Update expected output when selections change
  useEffect(() => {
    if ((outputMode === "select" || outputMode === "library") && selectedOutputs.length > 0) {
      // For simplicity, we'll just use the first selected output template
      // In a real app, you might want to combine them or handle multiple selections differently
      const selectedTemplate = outputTemplates.find((t) => t.id === selectedOutputs[0])
      if (selectedTemplate) {
        setExpectedOutput(selectedTemplate.output)
      }
    }
  }, [selectedOutputs, outputMode])

  // Update system message when basic template is selected
  useEffect(() => {
    if (selectedBasicTemplate) {
      const template = basicTemplateOptions.find((t) => t.id === selectedBasicTemplate)
      if (template) {
        setSystemMessage(template.systemMessage)
      }
    }
  }, [selectedBasicTemplate])

  // Update expected output when basic output is selected
  useEffect(() => {
    if (selectedBasicOutput) {
      const output = basicOutputOptions.find((o) => o.id === selectedBasicOutput)
      if (output) {
        setExpectedOutput(output.output)
      }
    }
  }, [selectedBasicOutput])

  // Toggle instruction selection
  const toggleInstruction = (id: string) => {
    setSelectedInstructions((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  // Toggle output selection
  const toggleOutput = (id: string) => {
    // For outputs, we'll just select one at a time for simplicity
    setSelectedOutputs([id])
  }

  // Get category counts for instructions
  const getCategoryCounts = () => {
    const counts: Record<string, number> = { all: instructionTemplates.length }

    instructionTemplates.forEach((template) => {
      if (!counts[template.category]) {
        counts[template.category] = 0
      }
      counts[template.category]++
    })

    return counts
  }

  // Get category counts for outputs
  const getOutputCategoryCounts = () => {
    const counts: Record<string, number> = { all: outputTemplates.length }

    outputTemplates.forEach((template) => {
      if (!counts[template.category]) {
        counts[template.category] = 0
      }
      counts[template.category]++
    })

    return counts
  }

  // Get unique output categories
  const getOutputCategories = () => {
    const categories = new Set<string>()
    outputTemplates.forEach((template) => {
      categories.add(template.category)
    })
    return Array.from(categories)
  }

  // Add a function to handle template selection
  const selectTemplate = (templateId: string) => {
    const template = templateLibrary.find((t) => t.id === templateId)
    if (template) {
      setSelectedTemplateId(templateId)
      setSelectedInstructions(template.instructions)
    }
  }

  // Add a function to handle output template selection
  const selectOutputTemplate = (templateId: string) => {
    const template = outputLibrary.find((t) => t.id === templateId)
    if (template) {
      setSelectedOutputTemplateId(templateId)
      setSelectedOutputs(template.outputs)
    }
  }

  // Add a helper function to get template details
  const getSelectedTemplateDetails = () => {
    if (!selectedTemplateId) return null

    const template = templateLibrary.find((t) => t.id === selectedTemplateId)
    if (!template) return null

    const instructionNames = template.instructions
      .map((id) => {
        const instruction = instructionTemplates.find((t) => t.id === id)
        return instruction ? instruction.name : null
      })
      .filter(Boolean)

    return {
      ...template,
      instructionNames,
    }
  }

  // Add a helper function to get output template details
  const getSelectedOutputTemplateDetails = () => {
    if (!selectedOutputTemplateId) return null

    const template = outputLibrary.find((t) => t.id === selectedOutputTemplateId)
    if (!template) return null

    const outputNames = template.outputs
      .map((id) => {
        const output = outputTemplates.find((t) => t.id === id)
        return output ? output.name : null
      })
      .filter(Boolean)

    return {
      ...template,
      outputNames,
    }
  }

  const categoryCounts = getCategoryCounts()
  const outputCategoryCounts = getOutputCategoryCounts()
  const outputCategories = getOutputCategories()

  // In the CardContent section, replace the existing content with this updated version:

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Agent prompts</CardTitle>
        <div className="flex flex-col space-y-1">
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <Server className="h-3 w-3" /> GET /api/agent-instructions/
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <Server className="h-3 w-3" /> POST /api/agents/:id/instructions/
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <Server className="h-3 w-3" /> POST /api/agents/:id/expected-output/
          </Badge>
        </div>
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
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Server className="h-3 w-3" /> POST /api/agents/:id/instructions/
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {basicTemplateOptions.map((template) => (
              <Card
                key={template.id}
                className={cn(
                  "cursor-pointer hover:border-primary transition-colors",
                  selectedBasicTemplate === template.id && "border-primary bg-primary/5",
                  template.id === "custom" && "border-dashed",
                )}
                onClick={() => {
                  setSelectedBasicTemplate(template.id)
                  if (template.id === "custom") {
                    setSystemMessage(customSystemMessage)
                  } else {
                    setSystemMessage(template.systemMessage)
                  }
                }}
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base flex items-center">
                    {template.id === "custom" ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 text-primary" />
                        {template.name}
                      </>
                    ) : (
                      template.name
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedBasicTemplate === "custom" && (
            <div className="mt-4">
              <label htmlFor="custom-system-message" className="text-sm font-medium block mb-2">
                Custom System Message
              </label>
              <Textarea
                id="custom-system-message"
                className="bg-muted min-h-[200px]"
                placeholder="Enter your custom system message here..."
                value={customSystemMessage}
                onChange={(e) => {
                  setCustomSystemMessage(e.target.value)
                  setSystemMessage(e.target.value)
                }}
              />
            </div>
          )}

          {selectedBasicTemplate && selectedBasicTemplate !== "custom" && (
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
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Server className="h-3 w-3" /> POST /api/agents/:id/expected-output/
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {basicOutputOptions.map((output) => (
              <Card
                key={output.id}
                className={cn(
                  "cursor-pointer hover:border-primary transition-colors",
                  selectedBasicOutput === output.id && "border-primary bg-primary/5",
                  output.id === "custom" && "border-dashed",
                )}
                onClick={() => {
                  setSelectedBasicOutput(output.id)
                  if (output.id === "custom") {
                    setExpectedOutput(customOutputFormat)
                  } else {
                    setExpectedOutput(output.output)
                  }
                }}
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base flex items-center">
                    {output.id === "custom" ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 text-primary" />
                        {output.name}
                      </>
                    ) : (
                      output.name
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">{output.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedBasicOutput === "custom" && (
            <div className="mt-4">
              <label htmlFor="custom-output-format" className="text-sm font-medium block mb-2">
                Custom Output Format
              </label>
              <Textarea
                id="custom-output-format"
                className="bg-muted min-h-[200px]"
                placeholder="Enter your custom output format here..."
                value={customOutputFormat}
                onChange={(e) => {
                  setCustomOutputFormat(e.target.value)
                  setExpectedOutput(e.target.value)
                }}
              />
            </div>
          )}

          {selectedBasicOutput && selectedBasicOutput !== "custom" && (
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

