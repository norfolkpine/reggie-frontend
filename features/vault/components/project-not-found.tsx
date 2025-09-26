"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ProjectNotFound() {
  const router = useRouter();
  return (
    <div className="text-center py-12 text-foreground">
      <h2 className="text-xl font-semibold">Project not found</h2>
      <p className="text-muted-foreground mt-2">The requested project could not be found.</p>
      <Button className="mt-4" onClick={() => router.push("/vault")}>
        Back to Vault
      </Button>
    </div>
  );
}


