'use client'

import { useEffect, useState } from 'react'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { GripVertical, X, Image, Type, Video, ListChecks, Trash2, Send } from 'lucide-react'

interface Component {
  id: string
  type: 'title' | 'image' | 'video' | 'text' | 'poll'
  content: string
  options?: string[]
}

interface Popup {
  id: string
  title: string
  components: Component[]
  active: boolean
  createdAt: string
}

function SortableComponent({ component, onRemove, onChange }: { component: Component; onRemove: () => void; onChange: (content: string, options?: string[]) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: component.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-white dark:bg-gray-800 p-4 rounded-lg border mb-2">
      <div className="flex items-center gap-2 mb-2">
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4" />
        </div>
        <span className="font-medium capitalize">{component.type}</span>
        <Button variant="ghost" size="sm" onClick={onRemove} className="ml-auto">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {component.type === 'title' && (
        <Input value={component.content} onChange={(e) => onChange(e.target.value)} placeholder="Enter title" />
      )}
      {component.type === 'text' && (
        <Textarea value={component.content} onChange={(e) => onChange(e.target.value)} placeholder="Enter text" />
      )}
      {component.type === 'image' && (
        <Input value={component.content} onChange={(e) => onChange(e.target.value)} placeholder="Image URL" />
      )}
      {component.type === 'video' && (
        <Input value={component.content} onChange={(e) => onChange(e.target.value)} placeholder="Video URL" />
      )}
      {component.type === 'poll' && (
        <div className="space-y-2">
          <Input value={component.content} onChange={(e) => onChange(e.target.value, component.options)} placeholder="Poll question" />
          {component.options?.map((opt, i) => (
            <Input key={i} value={opt} onChange={(e) => {
              const newOpts = [...(component.options || [])]
              newOpts[i] = e.target.value
              onChange(component.content, newOpts)
            }} placeholder={`Option ${i + 1}`} />
          ))}
          <Button size="sm" onClick={() => onChange(component.content, [...(component.options || []), ''])}>Add Option</Button>
        </div>
      )}
    </div>
  )
}

export default function PopupBuilder() {
  const [components, setComponents] = useState<Component[]>([])
  const [popupTitle, setPopupTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [popups, setPopups] = useState<Popup[]>([])

  useEffect(() => {
    fetchPopups()
  }, [])

  const fetchPopups = async () => {
    const res = await fetch('/api/admin/popups')
    const data = await res.json()
    setPopups(data.popups || [])
  }

  const addComponent = (type: Component['type']) => {
    const newComponent: Component = {
      id: `${type}-${Date.now()}`,
      type,
      content: '',
      options: type === 'poll' ? ['', ''] : undefined
    }
    setComponents([...components, newComponent])
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setComponents((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const savePopup = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/popups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: popupTitle, components })
      })
      const data = await res.json()
      if (res.ok) {
        alert('Popup saved!')
        window.location.href = `/admin/notifications/popup/${data.id}`
      }
    } catch (error) {
      alert('Failed to save')
    }
    setSaving(false)
  }

  const deletePopup = async (id: string) => {
    if (!confirm('Delete this popup?')) return
    await fetch(`/api/admin/popups/${id}`, { method: 'DELETE' })
    fetchPopups()
  }

  const repushPopup = async (id: string) => {
    await fetch(`/api/admin/popups/${id}/repush`, { method: 'POST' })
    alert('Popup repushed!')
  }

  return (
    <div className="space-y-6">
      {/* Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => addComponent('title')} className="w-full justify-start" variant="outline">
              <Type className="h-4 w-4 mr-2" /> Title
            </Button>
            <Button onClick={() => addComponent('text')} className="w-full justify-start" variant="outline">
              <Type className="h-4 w-4 mr-2" /> Text
            </Button>
            <Button onClick={() => addComponent('image')} className="w-full justify-start" variant="outline">
              <Image className="h-4 w-4 mr-2" /> Image
            </Button>
            <Button onClick={() => addComponent('video')} className="w-full justify-start" variant="outline">
              <Video className="h-4 w-4 mr-2" /> Video
            </Button>
            <Button onClick={() => addComponent('poll')} className="w-full justify-start" variant="outline">
              <ListChecks className="h-4 w-4 mr-2" /> Poll
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Create Popup</CardTitle>
            <div className="mt-4">
              <Label>Popup Title</Label>
              <Input value={popupTitle} onChange={(e) => setPopupTitle(e.target.value)} placeholder="Enter popup title" />
            </div>
          </CardHeader>
          <CardContent>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {components.map((component) => (
                  <SortableComponent
                    key={component.id}
                    component={component}
                    onRemove={() => setComponents(components.filter(c => c.id !== component.id))}
                    onChange={(content, options) => {
                      setComponents(components.map(c => c.id === component.id ? { ...c, content, options } : c))
                    }}
                  />
                ))}
              </SortableContext>
            </DndContext>
            
            {components.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                Drag components here to build your popup
              </div>
            )}

            <Button onClick={savePopup} disabled={saving || !popupTitle || components.length === 0} className="w-full mt-4">
              {saving ? 'Saving...' : 'Save Popup'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Existing Popups */}
      {popups.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Saved Popups</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {popups.map((popup) => (
              <Card key={popup.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => window.location.href = `/admin/notifications/popup/${popup.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{popup.title}</CardTitle>
                    <Badge variant={popup.active ? 'default' : 'secondary'}>{popup.active ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(popup.createdAt).toLocaleDateString()}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); repushPopup(popup.id) }}>
                      <Send className="h-4 w-4 mr-1" /> Repush
                    </Button>
                    <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); deletePopup(popup.id) }}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
