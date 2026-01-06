"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, MapPin, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { storeAPI } from "@/lib/api"
import { StoreProductVariants } from "@/components/store-product-variants"
import { StoreInventoryBatches } from "@/components/store-inventory-batches"
import { StoreProductsList } from "@/components/store-products-list"

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

interface StoreDetailManagementProps {
  storeId: string
}

export function StoreDetailManagement({ storeId }: StoreDetailManagementProps) {
  const router = useRouter()
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStore()
  }, [storeId])

  const loadStore = async () => {
    try {
      setLoading(true)
      
      // Validate store ID format before making the API call
      if (!storeId || !/^[0-9a-fA-F]{24}$/.test(storeId)) {
        console.error("Invalid store ID format:", storeId)
        setStore(null)
        return
      }
      
      const response = await storeAPI.getById(storeId)
      if (response.success && response.data) {
        setStore(response.data)
      } else {
        console.error("Failed to load store:", response.message)
        setStore(null)
      }
    } catch (error: any) {
      console.error("Failed to load store:", error)
      // If it's a 400 error, the store ID is invalid
      if (error.response?.status === 400) {
        console.error("Invalid store ID or store not found")
      }
      setStore(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!store) {
    return (
      <div className="space-y-6">
        <Link href="/stores">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Stores
          </Button>
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">Store not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <Link href="/stores">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {store.name}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                {store.location && store.location.coordinates && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {store.location.coordinates[1].toFixed(4)}, {store.location.coordinates[0].toFixed(4)}
                    </span>
                  </div>
                )}
                <Badge variant={store.isActive ? "default" : "secondary"}>
                  {store.isActive ? "Active" : "Inactive"}
                </Badge>
                {store.serviceRadiusKm !== undefined && (
                  <span className="text-sm text-slate-600">
                    Service Radius: {store.serviceRadiusKm} km
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">All Products</TabsTrigger>
          <TabsTrigger value="variants">Product Variants</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Batches</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <StoreProductsList storeId={storeId} />
        </TabsContent>

        <TabsContent value="variants" className="space-y-4">
          <StoreProductVariants storeId={storeId} />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <StoreInventoryBatches storeId={storeId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

