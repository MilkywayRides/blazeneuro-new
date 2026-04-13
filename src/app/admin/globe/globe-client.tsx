'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Location {
  id: string
  latitude: string
  longitude: string
  lastSeen: string
}

export default function GlobeClient() {
  const [locations, setLocations] = useState<Location[]>([])

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch('/api/admin/locations')
        if (res.ok) {
          const data = await res.json()
          setLocations(data.locations)
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
    <Card>
      <CardHeader>
        <CardTitle>Live Audience Locations</CardTitle>
        <CardDescription>Active devices: <span className="font-bold text-green-500">{locations.length}</span></CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device ID</TableHead>
              <TableHead>Latitude</TableHead>
              <TableHead>Longitude</TableHead>
              <TableHead>Last Seen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((loc) => (
              <TableRow key={loc.id}>
                <TableCell className="font-mono text-xs">{loc.id.slice(0, 8)}</TableCell>
                <TableCell>{loc.latitude}</TableCell>
                <TableCell>{loc.longitude}</TableCell>
                <TableCell>{new Date(loc.lastSeen).toLocaleTimeString()}</TableCell>
              </TableRow>
            ))}
            {locations.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No active devices
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
