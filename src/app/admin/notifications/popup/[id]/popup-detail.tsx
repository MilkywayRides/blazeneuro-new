'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Component {
  id: string
  type: string
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

export default function PopupDetail({ id }: { id: string }) {
  const [popup, setPopup] = useState<Popup | null>(null)

  useEffect(() => {
    fetch(`/api/admin/popups/${id}`)
      .then(res => res.json())
      .then(data => setPopup(data.popup))
  }, [id])

  if (!popup) return <div className="p-6">Loading...</div>

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{popup.title}</h1>
          <p className="text-sm text-muted-foreground">Created {new Date(popup.createdAt).toLocaleString()}</p>
        </div>
        <Badge variant={popup.active ? 'default' : 'secondary'}>
          {popup.active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {popup.components.map((comp, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="font-medium capitalize mb-2">{comp.type}</div>
                {comp.type === 'image' && comp.content && (
                  <img src={comp.content} alt="" className="w-full rounded" />
                )}
                {comp.type === 'video' && comp.content && (
                  <video src={comp.content} controls className="w-full rounded" />
                )}
                {comp.type === 'title' && (
                  <div className="text-lg font-bold">{comp.content}</div>
                )}
                {comp.type === 'text' && (
                  <div className="text-sm">{comp.content}</div>
                )}
                {comp.type === 'poll' && (
                  <div>
                    <div className="font-medium mb-2">{comp.content}</div>
                    {comp.options?.map((opt, j) => (
                      <div key={j} className="text-sm p-2 bg-gray-100 dark:bg-gray-800 rounded mb-1">{opt}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mobile Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-[360px] h-[640px] border-[14px] border-gray-800 rounded-[40px] shadow-2xl bg-white dark:bg-gray-900 overflow-y-auto">
              <div className="p-4 relative">
                <Button size="sm" variant="ghost" className="absolute top-2 right-2 h-8 w-8 p-0">✕</Button>
                <div className="space-y-4 mt-8">
                  {popup.components.map((comp, i) => (
                    <div key={i}>
                      {comp.type === 'title' && (
                        <h2 className="text-xl font-bold">{comp.content}</h2>
                      )}
                      {comp.type === 'text' && (
                        <p className="text-sm">{comp.content}</p>
                      )}
                      {comp.type === 'image' && comp.content && (
                        <img src={comp.content} alt="" className="w-full rounded-lg" />
                      )}
                      {comp.type === 'video' && comp.content && (
                        <video src={comp.content} autoPlay muted loop className="w-full rounded-lg" />
                      )}
                      {comp.type === 'poll' && (
                        <div className="space-y-2">
                          <p className="font-medium">{comp.content}</p>
                          {comp.options?.map((opt, j) => (
                            <button key={j} className="w-full p-3 text-left border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
