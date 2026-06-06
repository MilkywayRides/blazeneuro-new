"use client"

import React, { useCallback, useState } from "react"
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { updateWorkflow } from "../workflow-actions"
import { toast } from "sonner"
import { SaveIcon, PlusIcon, ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

export function FlowEditor({ workflow }: { workflow: any }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(workflow.nodes || initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow.edges || initialEdges)
  const [saving, setSaving] = useState(false)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onSave = async () => {
    setSaving(true)
    try {
      await updateWorkflow(workflow.id, { nodes, edges })
      toast.success("Workflow saved")
    } catch (error) {
      toast.error("Failed to save workflow")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const addNode = () => {
    const newNode: Node = {
      id: `node-${nodes.length + 1}`,
      data: { label: `Node ${nodes.length + 1}` },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      type: "default",
    }
    setNodes((nds) => nds.concat(newNode))
  }

  return (
    <div className="flex-1 flex flex-col relative w-full h-full min-h-[500px]">
      <div className="flex items-center justify-between p-4 border-b bg-background z-10">
        <div className="flex items-center gap-4">
          <Link href="/admin/workflow">
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="size-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-lg font-semibold">{workflow.name}</h2>
            <p className="text-sm text-muted-foreground">{workflow.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={addNode} className="gap-2">
            <PlusIcon className="size-4" />
            Add Node
          </Button>
          <Button size="sm" onClick={onSave} disabled={saving} className="gap-2">
            <SaveIcon className="size-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex-1 w-full h-full relative border rounded-md m-4 bg-muted/20">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  )
}
