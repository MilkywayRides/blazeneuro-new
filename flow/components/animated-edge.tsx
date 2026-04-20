"use client"

import { useId } from "react"
import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow'
import { motion } from 'framer-motion'

export default function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const gradientId = useId()
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ ...style, strokeWidth: 2, stroke: 'gray', strokeOpacity: 0.2 }} 
      />
      <path
        d={edgePath}
        strokeWidth={2}
        stroke={`url(#${gradientId})`}
        strokeOpacity="1"
        strokeLinecap="round"
        fill="none"
      />
      <defs>
        <motion.linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          initial={{
            x1: "10%",
            x2: "0%",
            y1: "0%",
            y2: "0%",
          }}
          animate={{
            x1: ["10%", "110%"],
            x2: ["0%", "100%"],
            y1: ["0%", "0%"],
            y2: ["0%", "0%"],
          }}
          transition={{
            duration: 5,
            ease: [0.16, 1, 0.3, 1],
            repeat: Infinity,
            repeatDelay: 0,
          }}
        >
          <stop stopColor="#ffaa40" stopOpacity="0" />
          <stop stopColor="#ffaa40" />
          <stop offset="32.5%" stopColor="#9c40ff" />
          <stop offset="100%" stopColor="#9c40ff" stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </>
  )
}
