'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false })

interface Location {
  id: string
  latitude: string
  longitude: string
  lastSeen: string
}

export default function GlobePage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [points, setPoints] = useState<any[]>([])

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch('/api/admin/locations')
        if (res.ok) {
          const data = await res.json()
          setLocations(data.locations)
          
          const newPoints = data.locations.map((loc: Location) => ({
            lat: parseFloat(loc.latitude),
            lng: parseFloat(loc.longitude),
            size: 0.5,
            color: 'red'
          }))
          setPoints(newPoints)
        }
      } catch (error) {
        console.error('Failed to fetch locations:', error)
      }
    }

    fetchLocations()
    const interval = setInterval(fetchLocations, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
        <nav className="space-y-2">
          <a href="/admin" className="block p-2 hover:bg-gray-800 rounded">Dashboard</a>
          <a href="/admin/users" className="block p-2 hover:bg-gray-800 rounded">Users</a>
          <a href="/admin/blogs" className="block p-2 hover:bg-gray-800 rounded">Blogs</a>
          <a href="/admin/globe" className="block p-2 bg-gray-800 rounded">Live Globe</a>
          <a href="/admin/analytics" className="block p-2 hover:bg-gray-800 rounded">Analytics</a>
        </nav>
      </aside>
      
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Live Audience Globe</h1>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <p className="text-sm">Active devices: <span className="font-bold text-green-500">{locations.length}</span></p>
        </div>
        <div className="h-[calc(100vh-200px)]">
          <Globe
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            pointsData={points}
            pointAltitude={0.01}
            pointColor="color"
            pointRadius="size"
            pointLabel={() => 'Active User'}
            backgroundColor="rgba(0,0,0,0)"
          />
        </div>
      </main>
    </div>
  )
}
