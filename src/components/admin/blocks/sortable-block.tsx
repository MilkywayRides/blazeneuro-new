"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";

interface SortableBlockProps {
  id: string;
  children: React.ReactNode;
  onAdd: () => void;
  onRemove: () => void;
}

export function SortableBlock({ id, children, onAdd, onRemove }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? "opacity-50" : ""}`}
    >
      {/* Floating Toolbar on Hover */}
      <div className="absolute -top-3 right-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-background border shadow-md rounded-md p-1 z-50">
        <button
          {...attributes}
          {...listeners}
          className="p-1.5 hover:bg-muted rounded text-muted-foreground cursor-grab active:cursor-grabbing"
          title="Drag to move"
        >
          <GripVertical size={16} />
        </button>
        <button
          onClick={onAdd}
          className="p-1.5 hover:bg-muted rounded text-muted-foreground"
          title="Add block below"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 hover:bg-destructive/10 text-destructive rounded"
          title="Remove block"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {children}
    </div>
  );
}
