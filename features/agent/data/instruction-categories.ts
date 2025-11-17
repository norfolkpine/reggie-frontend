export const INSTRUCTION_CATEGORIES = {
  SCOPE: "Scope & Knowledge Boundaries",
  RETRIEVAL: "Information Retrieval & Accuracy",
  RESPONSE_FORMATTING: "Response Handling & Formatting",
  COMPLIANCE: "Compliance-Specific Instructions",
  PERSONALITY: "Personality",
  PROCESS: "Process",
  IMPROVEMENT: "Improvement",
} as const

export type InstructionCategory = keyof typeof INSTRUCTION_CATEGORIES