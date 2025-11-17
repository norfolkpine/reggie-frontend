"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { AgentForm } from "../components/types";

interface AgentContextType {
  agentData: AgentForm;
  setAgentData: (data: Partial<AgentForm>) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  isFetchingData: boolean;
  setIsFetchingData: (value: boolean) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agentData, setAgentData] = useState<AgentForm>({
    name: "",
    description: "",
    systemMessage: "",
    expectedOutput: "",
    model: "",
    systemTemplateId: "",
    expectedTemplateId: "",
    files: [],
    urls: [],
    isCite: false,
    limitPrompts: 0,
    limitCompletions: 0,
    limitMessages: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);

  const updateAgentData = (data: Partial<AgentForm>) => {
    setAgentData((prev) => ({ ...prev, ...data }));
  };

  return (
    <AgentContext.Provider
      value={{
        agentData,
        setAgentData: updateAgentData,
        isSubmitting,
        setIsSubmitting,
        isFetchingData,
        setIsFetchingData,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error("useAgent must be used within an AgentProvider");
  }
  return context;
}