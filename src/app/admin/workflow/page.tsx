import { getWorkflows } from "./workflow-actions"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, GitGraphIcon } from "lucide-react"
import { WorkflowForm } from "./workflow-form"

export default async function WorkflowPage() {
  const workflows = await getWorkflows()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground">Manage your automation and page flows.</p>
        </div>
        <WorkflowForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workflows.length === 0 ? (
          <Card className="col-span-full py-12">
            <CardContent className="flex flex-col items-center justify-center gap-4">
              <GitGraphIcon className="size-12 text-muted-foreground opacity-20" />
              <p className="text-xl font-medium text-muted-foreground">No workflows found</p>
              <WorkflowForm />
            </CardContent>
          </Card>
        ) : (
          workflows.map((flow) => (
            <Link key={flow.id} href={`/admin/workflow/${flow.id}`}>
              <Card className="hover:bg-accent transition-colors h-full cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitGraphIcon className="size-5" />
                    {flow.name}
                  </CardTitle>
                  <CardDescription>
                    {flow.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Created at: {new Date(flow.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
