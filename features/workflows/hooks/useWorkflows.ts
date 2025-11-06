import { useState, useEffect } from "react";
import { toast } from "sonner";
import { listWorkflows } from "@/api/workflows";
import { Workflow } from "@/types/api";

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadWorkflows = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await listWorkflows();
      setWorkflows(response.results);
    } catch (error) {
      console.error('Failed to load workflows:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load workflows';
      setError(error instanceof Error ? error : new Error(errorMessage));
      toast.error(errorMessage);
      setWorkflows([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  return {
    workflows,
    isLoading,
    error,
    loadWorkflows,
  };
}
