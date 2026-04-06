"use client"

import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export function DeployButton({ projectId }: { projectId: string }) {
  const [deploying, setDeploying] = useState(false);
  const router = useRouter();

  async function handleDeploy() {
    setDeploying(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/deploy`, {
        method: "POST",
      });
      
      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Deploy failed:", error);
    } finally {
      setDeploying(false);
    }
  }

  return (
    <Button onClick={handleDeploy} disabled={deploying}>
      {deploying ? <Spinner className="h-4 w-4 mr-2" /> : <Rocket className="h-4 w-4 mr-2" />}
      Deploy
    </Button>
  );
}
