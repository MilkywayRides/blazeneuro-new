'use client'

import { useEffect, useState } from 'react'

interface Location {
  id: string
  latitude: string
  longitude: string
  lastSeen: string
}

export default function GlobePage() {
  const [locations, setLocations] = useState<Location[]>([])

  useEffect(() => {
    const fetchLocations = async () => {
      const res = await fetch('/api/admin/locations')
      if (res.ok) {
        const data = await res.json()
        setLocations(data.locations)
      }
    }

    fetchLocations()
    const interval = setInterval(fetchLocations, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Live Audience Globe</h1>
      <div className="bg-gray-900 rounded-lg p-4 h-[600px] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-96 h-96 rounded-full bg-blue-500/20 border-2 border-blue-500 relative">
            {locations.map((loc) => {
              const lat = parseFloat(loc.latitude)
              const lng = parseFloat(loc.longitude)
              const x = 50 + (lng / 180) * 40
              const y = 50 - (lat / 90) * 40
              
              return (
                <div
                  key={loc.id}
                  className="absolute w-3 h-3 bg-red-500 rounded-full animate-pulse"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  title={`${lat}, ${lng}`}
                />
              )
            })}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600">Active devices: {locations.length}</p>
      </div>
    </div>
  )
}
