"use client"

import * as React from "react"
import { MoreHorizontal, Search, MapPin, Edit, Trash2, Users, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { storeAPI } from "@/lib/api"
import { useState, useEffect } from "react"

interface Store {
  _id: string
  name: string
  location: {
    type: 'Point'
    coordinates: [number, number] // [lng, lat]
  }
  serviceRadiusKm: number
  isActive: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}

export function StoreTable() {
  const router = useRouter()
  const [stores, setStores] = React.useState<Store[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [storeToDelete, setStoreToDelete] = React.useState<string | null>(null)

  useEffect(() => {
    loadStores()
  }, [])

  const loadStores = async () => {
    try {
      setLoading(true)
      const response = await storeAPI.getAll()
      setStores(response.data || [])
    } catch (error) {
      console.error("Failed to load stores:", error)
      // Use dummy data for now
      setStores([
        {
          _id: "1",
          name: "Store 1 - Downtown",
          location: { type: 'Point', coordinates: [77.5946, 12.9716] },
          serviceRadiusKm: 5,
          isActive: true,
        },
        {
          _id: "2",
          name: "Store 2 - Malleshwaram",
          location: { type: 'Point', coordinates: [77.5667, 13.0050] },
          serviceRadiusKm: 7,
          isActive: true,
        },
        {
          _id: "3",
          name: "Dark Store - Warehouse",
          location: { type: 'Point', coordinates: [77.6500, 12.9000] },
          serviceRadiusKm: 10,
          isActive: false,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async () => {
    if (!storeToDelete) return
    try {
      await storeAPI.delete(storeToDelete)
      setStores(stores.filter((s) => s._id !== storeToDelete))
      setDeleteDialogOpen(false)
      setStoreToDelete(null)
    } catch (error) {
      console.error("Failed to delete store:", error)
    }
  }

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Service Radius</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No stores found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStores.map((store) => (
                  <TableRow 
                    key={store._id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={(e) => {
                      // Don't navigate if clicking on dropdown or button
                      if ((e.target as HTMLElement).closest('[role="menu"]') || (e.target as HTMLElement).closest('button')) {
                        return
                      }
                      router.push(`/stores/${store._id}`)
                    }}
                  >
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {store.location.coordinates[1].toFixed(4)}, {store.location.coordinates[0].toFixed(4)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{store.serviceRadiusKm} km</TableCell>
                    <TableCell>
                      <Badge variant={store.isActive ? "default" : "secondary"}>
                        {store.isActive ? "Open" : "Closed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => router.push(`/stores/${store._id}`)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Manage Products & Inventory
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/stores/${store._id}/staff`)}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Manage Staff
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setStoreToDelete(store._id)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

