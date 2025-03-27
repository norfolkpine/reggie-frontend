import { LucideIcon, Briefcase, Home, Shield, Scale, LineChart, Landmark } from "lucide-react"

export interface Agent {
  id: number
  name: string
  description: string
  icon: LucideIcon
  category: string
  popular: boolean
  capabilities: string[]
  backgroundColor: string
}

export const agents: Agent[] = [
  {
    id: 1,
    name: "Accounting Specialist",
    description: "Expert in Australian tax law, financial reporting, and corporate accounting standards",
    icon: Briefcase,
    category: "Finance",
    popular: true,
    capabilities: ["Tax Compliance", "Financial Analysis", "Audit Support"],
    backgroundColor: "bg-blue-50",
  },
  {
    id: 2,
    name: "Real Estate Advisor",
    description: "Specialized in Australian property law, market analysis, and investment strategies",
    icon: Home,
    category: "Real Estate",
    popular: true,
    capabilities: ["Property Valuation", "Market Trends", "Legal Requirements"],
    backgroundColor: "bg-green-50",
  },
  {
    id: 3,
    name: "AML/KYC Compliance",
    description: "Expert in Anti-Money Laundering and Know Your Customer regulations in Australia",
    icon: Shield,
    category: "Compliance",
    popular: false,
    capabilities: ["Risk Assessment", "Compliance Checks", "Regulatory Updates"],
    backgroundColor: "bg-red-50",
  },
  {
    id: 5,
    name: "Legal Assistant",
    description: "Expert in Australian corporate law, contracts, and legal document analysis",
    icon: Scale,
    category: "Legal",
    popular: true,
    capabilities: ["Contract Review", "Legal Research", "Compliance Guidance"],
    backgroundColor: "bg-indigo-50",
  },
  {
    id: 7,
    name: "Financial Analyst",
    description: "Expert in market analysis, investment strategies, and financial forecasting for Australian markets",
    icon: LineChart,
    category: "Finance",
    popular: false,
    capabilities: ["Market Analysis", "Investment Strategies", "Financial Modeling"],
    backgroundColor: "bg-blue-50",
  },
  {
    id: 8,
    name: "Banking Compliance",
    description: "Specialized in Australian banking regulations, APRA requirements, and financial compliance",
    icon: Landmark,
    category: "Compliance",
    popular: true,
    capabilities: ["APRA Compliance", "Banking Regulations", "Risk Management"],
    backgroundColor: "bg-teal-50",
  },
]

export const categories = ["All", "Finance", "Real Estate", "Compliance", "Legal"]