import { getWorkflowById } from "../workflow-actions"
import { notFound } from "next/navigation"
import { FlowEditor } from "./flow-editor"

export default async function WorkflowEditorPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const workflow = await getWorkflowById(id)

  if (!workflow) {
    notFound()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.12))] overflow-hidden">
      <FlowEditor workflow={workflow} />
    </div>
  )
}
