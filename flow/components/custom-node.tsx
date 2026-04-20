"use client"

import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'
import { Card, CardContent } from '@/components/ui/card'

function CustomNode({ data }: NodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <Card className="min-w-[150px]">
        <CardContent className="p-3">
          <div className="text-sm font-medium">{data.label}</div>
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Right} />
    </>
  )
}

export default memo(CustomNode)
