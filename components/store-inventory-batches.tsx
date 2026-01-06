"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2 } from "lucide-react"
import { storeProductAPI, inventoryBatchAPI } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface StoreProduct {
  _id: string
  productId: {
    _id: string
    name: string
  }
  variants: Array<{
    sku: string
    size: number
    unit: string
  }>
}

interface InventoryBatch {
  _id: string
  productId: {
    _id: string
    name: string
  }
  variantSku?: string
  initialQuantity: number
  availableQuantity: number
  costPrice: number
  batchNumber?: string
  supplier?: string
  purchaseDate?: string
  expiryDate?: string
  status: string
  createdAt: string
}

interface StoreInventoryBatchesProps {
  storeId: string
}

export function StoreInventoryBatches({ storeId }: StoreInventoryBatchesProps) {
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([])
  const [batches, setBatches] = useState<InventoryBatch[]>([])
  const [loading, setLoading] = useState(false)
  const [grnDialogOpen, setGrnDialogOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  const [formData, setFormData] = useState({
    productId: "",
    variantSku: "",
    initialQuantity: "",
    costPrice: "",
    batchNumber: "",
    supplier: "",
    purchaseDate: "",
    expiryDate: "",
    usesSharedStock: false,
    baseUnit: "kg" as "kg" | "g" | "ml" | "liter" | "piece" | "pack",
  })

  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null)

  useEffect(() => {
    loadStoreProducts()
    loadBatches()
  }, [storeId])

  const loadStoreProducts = async () => {
    try {
      const response = await storeProductAPI.getByStore(storeId)
      // Handle different response structures
      const products = response.data?.storeProducts || response.storeProducts || response.data || []
      setStoreProducts(Array.isArray(products) ? products : [])
    } catch (error) {
      console.error("Failed to load store products:", error)
      setStoreProducts([]) // Ensure it's always an array even on error
    }
  }

  const loadBatches = async () => {
    try {
      setLoading(true)
      const response = await inventoryBatchAPI.getAll({ storeId })
      setBatches(response.data || [])
    } catch (error) {
      console.error("Failed to load batches:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProductSelect = (productId: string) => {
    const product = storeProducts.find((p) => p.productId._id === productId)
    setSelectedProduct(product || null)
    setFormData({
      ...formData,
      productId,
      variantSku: "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.productId) {
      alert("Please select a product")
      return
    }

    if (!formData.usesSharedStock && !formData.variantSku) {
      alert("Please select a variant or enable shared stock")
      return
    }

    if (formData.usesSharedStock && !formData.baseUnit) {
      alert("Please select a base unit for shared stock")
      return
    }

    if (!formData.initialQuantity || parseFloat(formData.initialQuantity) <= 0) {
      alert("Please enter a valid quantity")
      return
    }

    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) {
      alert("Please enter a valid cost price")
      return
    }

    try {
      setFormLoading(true)
      const batchData: any = {
        storeId,
        productId: formData.productId,
        initialQuantity: parseFloat(formData.initialQuantity),
        costPrice: parseFloat(formData.costPrice),
        usesSharedStock: formData.usesSharedStock,
      }

      if (formData.usesSharedStock) {
        batchData.baseUnit = formData.baseUnit
      } else if (formData.variantSku) {
        batchData.variantSku = formData.variantSku
      }

      if (formData.batchNumber) batchData.batchNumber = formData.batchNumber
      if (formData.supplier) batchData.supplier = formData.supplier
      if (formData.purchaseDate) batchData.purchaseDate = formData.purchaseDate
      if (formData.expiryDate) batchData.expiryDate = formData.expiryDate

      await inventoryBatchAPI.create(batchData)
      setGrnDialogOpen(false)
      setFormData({
        productId: "",
        variantSku: "",
        initialQuantity: "",
        costPrice: "",
        batchNumber: "",
        supplier: "",
        purchaseDate: "",
        expiryDate: "",
        usesSharedStock: false,
        baseUnit: "kg" as "kg" | "g" | "ml" | "liter" | "piece" | "pack",
      })
      setSelectedProduct(null)
      loadBatches()
      loadStoreProducts() // Reload to update stock
    } catch (error: any) {
      console.error("Failed to create batch:", error)
      alert(error.response?.data?.message || "Failed to create inventory batch. Please try again.")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDialogClose = () => {
    setGrnDialogOpen(false)
    setFormData({
      productId: "",
      variantSku: "",
      initialQuantity: "",
      costPrice: "",
      batchNumber: "",
      supplier: "",
      purchaseDate: "",
      expiryDate: "",
      usesSharedStock: false,
      baseUnit: "kg" as "kg" | "g" | "ml" | "liter" | "piece" | "pack",
    })
    setSelectedProduct(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Batches</CardTitle>
              <CardDescription>
                View and manage inventory batches for this store
              </CardDescription>
            </div>
            <Dialog open={grnDialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Stock (GRN)
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Stock (GRN - Goods Receipt Note)</DialogTitle>
                  <DialogDescription>
                    Record a new inventory batch for this store
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="product">Product *</Label>
                      <Select
                        value={formData.productId}
                        onValueChange={handleProductSelect}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {storeProducts.map((sp) => (
                            <SelectItem key={sp._id} value={sp.productId._id}>
                              {sp.productId.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {storeProducts.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No products found. Please create product variants first.
                        </p>
                      )}
                    </div>

                    {formData.productId && selectedProduct && (
                      <>
                        <div className="space-y-2">
                          <Label>
                            <input
                              type="checkbox"
                              checked={formData.usesSharedStock}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  usesSharedStock: e.target.checked,
                                  variantSku: e.target.checked ? "" : formData.variantSku,
                                })
                              }
                              className="mr-2"
                            />
                            Use Shared Stock (across all variants)
                          </Label>
                        </div>

                        {formData.usesSharedStock && (
                          <div className="space-y-2">
                            <Label htmlFor="baseUnit">Base Unit *</Label>
                            <Select
                              value={formData.baseUnit}
                              onValueChange={(value) =>
                                setFormData({
                                  ...formData,
                                  baseUnit: value as "kg" | "g" | "ml" | "liter" | "piece" | "pack",
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select base unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="g">g</SelectItem>
                                <SelectItem value="ml">ml</SelectItem>
                                <SelectItem value="liter">liter</SelectItem>
                                <SelectItem value="piece">piece</SelectItem>
                                <SelectItem value="pack">pack</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {!formData.usesSharedStock && (
                          <div className="space-y-2">
                            <Label htmlFor="variant">Variant *</Label>
                            <Select
                              value={formData.variantSku}
                              onValueChange={(value) =>
                                setFormData({ ...formData, variantSku: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select variant" />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedProduct.variants.map((variant) => (
                                  <SelectItem key={variant.sku} value={variant.sku}>
                                    {variant.sku} ({variant.size} {variant.unit})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="initialQuantity">Quantity *</Label>
                        <Input
                          id="initialQuantity"
                          type="number"
                          step="0.01"
                          value={formData.initialQuantity}
                          onChange={(e) =>
                            setFormData({ ...formData, initialQuantity: e.target.value })
                          }
                          placeholder="Enter quantity"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="costPrice">Cost Price (₹) *</Label>
                        <Input
                          id="costPrice"
                          type="number"
                          step="0.01"
                          value={formData.costPrice}
                          onChange={(e) =>
                            setFormData({ ...formData, costPrice: e.target.value })
                          }
                          placeholder="Enter cost price"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="batchNumber">Batch Number</Label>
                        <Input
                          id="batchNumber"
                          value={formData.batchNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, batchNumber: e.target.value })
                          }
                          placeholder="Optional"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supplier">Supplier</Label>
                        <Input
                          id="supplier"
                          value={formData.supplier}
                          onChange={(e) =>
                            setFormData({ ...formData, supplier: e.target.value })
                          }
                          placeholder="Optional"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="purchaseDate">Purchase Date</Label>
                        <Input
                          id="purchaseDate"
                          type="date"
                          value={formData.purchaseDate}
                          onChange={(e) =>
                            setFormData({ ...formData, purchaseDate: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          type="date"
                          value={formData.expiryDate}
                          onChange={(e) =>
                            setFormData({ ...formData, expiryDate: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDialogClose}
                      disabled={formLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={formLoading}>
                      {formLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Stock
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <p className="text-slate-500">
                          {storeProducts.length === 0 
                            ? "No inventory batches found. Please add product variants first, then you can add inventory batches."
                            : "No inventory batches found. Click 'Add Stock (GRN)' to create one."}
                        </p>
                        {storeProducts.length > 0 && (
                          <Button
                            onClick={() => setGrnDialogOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Your First Inventory Batch
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  batches.map((batch) => (
                    <TableRow key={batch._id}>
                      <TableCell className="font-mono text-sm">
                        {batch.batchNumber || batch._id.slice(-8)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {batch.productId?.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {batch.variantSku ? (
                          <Badge variant="outline">{batch.variantSku}</Badge>
                        ) : (
                          <Badge variant="secondary">Shared Stock</Badge>
                        )}
                      </TableCell>
                      <TableCell>{batch.initialQuantity}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            batch.availableQuantity < batch.initialQuantity * 0.2
                              ? "destructive"
                              : "default"
                          }
                        >
                          {batch.availableQuantity}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{batch.costPrice}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            batch.status === "active" ? "default" : "secondary"
                          }
                        >
                          {batch.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {batch.expiryDate
                          ? new Date(batch.expiryDate).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

