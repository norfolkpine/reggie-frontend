import { INSTRUCTION_CATEGORIES } from './instruction-categories'

export interface OutputTemplate {
  id: string
  name: string
  description: string
  category: string
  is_global: boolean
  is_enabled: boolean
  output: string
}

export interface OutputSet {
  id: string
  name: string
  description: string
  category: string
  outputs: string[]
}

export const outputTemplates: OutputTemplate[] = [
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

export const outputLibrary: OutputSet[] = [
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