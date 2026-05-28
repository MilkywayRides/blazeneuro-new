"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { BlockType, blockRegistry } from "./blocks/registry";
import { SortableBlock } from "./blocks/sortable-block";
import { saveDashboardLayout } from "@/app/admin/dashboard-actions";
import { toast } from "sonner";

interface BlockInstance {
  id: string;
  type: BlockType;
}

interface TabConfig {
  id: string;
  name: string;
  blocks: BlockInstance[];
}

interface DashboardBuilderProps {
  initialTableData: Record<string, unknown>[];
  initialConfig?: TabConfig[] | null;
}

export function DashboardBuilder({ initialTableData, initialConfig }: DashboardBuilderProps) {
  const [tabs, setTabs] = React.useState<TabConfig[]>(() => {
    if (initialConfig && initialConfig.length > 0) {
      return initialConfig;
    }
    return [
      {
        id: "tab-1",
        name: "Overview",
        blocks: [
          { id: "b1", type: "sectionCards" },
          { id: "b2", type: "chartArea" },
          { id: "b3", type: "dataTable" },
        ],
      },
    ];
  });
  
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "tab-1");

  // Save changes to DB
  const saveLayout = React.useCallback(async (config: TabConfig[]) => {
    try {
      await saveDashboardLayout(config);
    } catch (error) {
      console.error("Failed to save layout:", error);
      toast.error("Failed to save dashboard layout");
    }
  }, []);

  // Debounced save effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      saveLayout(tabs);
    }, 1000);
    return () => clearTimeout(timer);
  }, [tabs, saveLayout]);

  // Add Block Dialog State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [insertAfterBlockId, setInsertAfterBlockId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires moving 5px before dragging starts to allow clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTabs((currentTabs) =>
        currentTabs.map((tab) => {
          if (tab.id === activeTab) {
            const oldIndex = tab.blocks.findIndex((b) => b.id === active.id);
            const newIndex = tab.blocks.findIndex((b) => b.id === over.id);
            return {
              ...tab,
              blocks: arrayMove(tab.blocks, oldIndex, newIndex),
            };
          }
          return tab;
        })
      );
    }
  };

  const handleAddTab = () => {
    const newTabId = `tab-${Date.now()}`;
    setTabs((current) => [
      ...current,
      {
        id: newTabId,
        name: `Tab ${current.length + 1}`,
        blocks: [],
      },
    ]);
    setActiveTab(newTabId);
  };

  const openAddBlockDialog = (blockId: string | null = null) => {
    setInsertAfterBlockId(blockId);
    setIsAddDialogOpen(true);
  };

  const addBlock = (type: BlockType) => {
    setTabs((currentTabs) =>
      currentTabs.map((tab) => {
        if (tab.id === activeTab) {
          const newBlock: BlockInstance = {
            id: `block-${Date.now()}`,
            type,
          };

          if (insertAfterBlockId) {
            const index = tab.blocks.findIndex((b) => b.id === insertAfterBlockId);
            const newBlocks = [...tab.blocks];
            newBlocks.splice(index + 1, 0, newBlock);
            return { ...tab, blocks: newBlocks };
          } else {
            return { ...tab, blocks: [...tab.blocks, newBlock] };
          }
        }
        return tab;
      })
    );
    setIsAddDialogOpen(false);
  };

  const removeBlock = (blockId: string) => {
    if (confirm("Are you sure you want to remove this block?")) {
      setTabs((currentTabs) =>
        currentTabs.map((tab) => {
          if (tab.id === activeTab) {
            return {
              ...tab,
              blocks: tab.blocks.filter((b) => b.id !== blockId),
            };
          }
          return tab;
        })
      );
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center px-4 lg:px-6 mb-4">
          <TabsList className="flex-wrap h-auto">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddTab}
            className="ml-2"
          >
            <Plus size={16} className="mr-1" /> Add Tab
          </Button>
        </div>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-0 outline-none">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tab.blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  {tab.blocks.map((block) => (
                    <SortableBlock
                      key={block.id}
                      id={block.id}
                      onAdd={() => openAddBlockDialog(block.id)}
                      onRemove={() => removeBlock(block.id)}
                    >
                      {blockRegistry[block.type] ? (
                        blockRegistry[block.type].render({
                          tableData: initialTableData,
                        })
                      ) : (
                        <div className="p-4 border border-destructive text-destructive rounded-md">
                          Unknown block type: {block.type}
                        </div>
                      )}
                    </SortableBlock>
                  ))}

                  {/* Empty state / Add first block button */}
                  {tab.blocks.length === 0 && (
                    <div className="flex items-center justify-center p-12 border-2 border-dashed rounded-lg">
                      <Button onClick={() => openAddBlockDialog(null)}>
                        <Plus size={16} className="mr-2" /> Add Block
                      </Button>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add Block Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Block</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            {Object.values(blockRegistry).map((block) => (
              <Button
                key={block.id}
                variant="outline"
                className="justify-start h-12 px-4"
                onClick={() => addBlock(block.id as BlockType)}
              >
                {block.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
