import { InstructionTemplate } from './instruction-templates'

export interface TemplateSet {
  id: string
  name: string
  description: string
  category: string
  instructions: string[]
}

export const templateLibrary: TemplateSet[] = [
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