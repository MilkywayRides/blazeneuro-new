"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useCallback, useMemo, useState } from "react"
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
} from 'reactflow'
import 'reactflow/dist/style.css'
import AnimatedEdge from "@/components/animated-edge"
import CustomNode from "@/components/custom-node"

const initialNodes = [
  { id: '1', type: 'custom', position: { x: 100, y: 100 }, data: { label: 'Start' } },
  { id: '2', type: 'custom', position: { x: 300, y: 100 }, data: { label: 'Process' } },
  { id: '3', type: 'custom', position: { x: 500, y: 100 }, data: { label: 'End' } },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'animated' },
  { id: 'e2-3', source: '2', target: '3', type: 'animated' },
]

const nodeOptions = [
  'Input',
  'Process',
  'Transform',
  'Output',
  'Publish',
  'Decision',
  'Data',
  'Action',
  'API Call',
  'Database',
  'Filter',
  'Aggregate',
  'Join',
  'Split',
  'Merge',
  'Validate',
  'Enrich',
]

function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [search, setSearch] = useState('')
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [executingNodes, setExecutingNodes] = useState<Set<string>>(new Set())
  const { screenToFlowPosition } = useReactFlow()
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), [])
  const edgeTypes = useMemo(() => ({ animated: AnimatedEdge }), [])

  // WebSocket for execution updates
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/ui-client')
    
    ws.onopen = () => {
      console.log('WebSocket connected')
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log('Received execution update:', data)
      
      if (data.status === 'executing') {
        setExecutingNodes(prev => new Set(prev).add(data.nodeId))
        setNodes(nds => nds.map(n => 
          n.id === data.nodeId 
            ? { ...n, style: { ...n.style, border: '3px solid #3b82f6', boxShadow: '0 0 20px #3b82f6' } }
            : n
        ))
      } else if (data.status === 'completed') {
        setExecutingNodes(prev => {
          const next = new Set(prev)
          next.delete(data.nodeId)
          return next
        })
        setNodes(nds => nds.map(n => 
          n.id === data.nodeId 
            ? { ...n, style: { ...n.style, border: '3px solid #10b981', boxShadow: '0 0 20px #10b981' } }
            : n
        ))
        
        // Reset after 2s
        setTimeout(() => {
          setNodes(nds => nds.map(n => 
            n.id === data.nodeId 
              ? { ...n, style: { ...n.style, border: undefined, boxShadow: undefined } }
              : n
          ))
        }, 2000)
      }
    }
    
    return () => ws.close()
  }, [setNodes])

  // Load from localStorage on mount
  useEffect(() => {
    const savedNodes = localStorage.getItem('flow-nodes')
    const savedEdges = localStorage.getItem('flow-edges')
    
    if (savedNodes) {
      setNodes(JSON.parse(savedNodes))
    } else {
      setNodes(initialNodes)
    }
    
    if (savedEdges) {
      setEdges(JSON.parse(savedEdges))
    } else {
      setEdges(initialEdges)
    }
  }, [setNodes, setEdges])

  // Save to localStorage whenever nodes or edges change
  useEffect(() => {
    if (nodes.length > 0) {
      localStorage.setItem('flow-nodes', JSON.stringify(nodes))
    }
  }, [nodes])

  useEffect(() => {
    if (edges.length > 0) {
      localStorage.setItem('flow-edges', JSON.stringify(edges))
    }
  }, [edges])

  const filteredOptions = useMemo(() => 
    nodeOptions.filter(option => 
      option.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  )

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'animated' }, eds)),
    [setEdges]
  )

  const addNode = useCallback((type: string, event: React.MouseEvent) => {
    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    })
    
    const id = `${Date.now()}`
    const newNode: Node = {
      id,
      type: 'custom',
      position,
      data: { label: type },
    }
    setNodes((nds) => [...nds, newNode])
    setSearch('')
  }, [screenToFlowPosition, setNodes])

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't delete if user is typing in an input/textarea
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }
      
      if (event.key === 'Delete' || event.key === 'Backspace') {
        setNodes((nds) => nds.filter((node) => !node.selected))
        setEdges((eds) => eds.filter((edge) => !edge.selected))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setNodes, setEdges])

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <div className="p-2">
            <Input
              placeholder="Search nodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
          />
        </div>
        <ScrollArea className="h-[200px]">
          {filteredOptions.map((option) => (
            <ContextMenuItem key={option} onClick={(e) => addNode(option, e)}>
              Add {option} Node
            </ContextMenuItem>
          ))}
        </ScrollArea>
      </ContextMenuContent>
    </ContextMenu>

    <Sheet open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Node Details</SheetTitle>
          <SheetDescription>
            Configure node settings
          </SheetDescription>
        </SheetHeader>
        {selectedNode && (
          <div className="mt-6 space-y-4">
            <div>
              <Label>Node ID</Label>
              <p className="text-sm text-muted-foreground">{selectedNode.id}</p>
            </div>
            <div>
              <Label>Type</Label>
              <p className="text-sm text-muted-foreground">{selectedNode.data.label}</p>
            </div>
            <div>
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Enter AI prompt..."
                value={selectedNode.data.prompt || ''}
                onChange={(e) => {
                  const newValue = e.target.value
                  setNodes((nds) =>
                    nds.map((n) =>
                      n.id === selectedNode.id
                        ? { ...n, data: { ...n.data, prompt: newValue } }
                        : n
                    )
                  )
                  setSelectedNode((prev) => 
                    prev ? { ...prev, data: { ...prev.data, prompt: newValue } } : null
                  )
                }}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={selectedNode.data.temperature || '0.7'}
                onChange={(e) => {
                  const newValue = e.target.value
                  setNodes((nds) =>
                    nds.map((n) =>
                      n.id === selectedNode.id
                        ? { ...n, data: { ...n.data, temperature: newValue } }
                        : n
                    )
                  )
                  setSelectedNode((prev) => 
                    prev ? { ...prev, data: { ...prev.data, temperature: newValue } } : null
                  )
                }}
              />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  </>
  )
}

export default function DataFlowPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">Data Flow</h1>
        </header>
        <style jsx global>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
        <div className="flex-1 w-full h-[calc(100vh-4rem)]">
          <ReactFlowProvider>
            <FlowCanvas />
          </ReactFlowProvider>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
