'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false })

interface Location {
  id: string
  latitude: string
  longitude: string
  lastSeen: string
}

export default function GlobeClient() {
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
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Live Audience</CardTitle>
          <CardDescription>Real-time device locations from mobile app users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            Active devices: <span className="font-bold text-green-500">{locations.length}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0">
          <div className="h-[600px]">
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
        </CardContent>
      </Card>
    </div>
  )
}
