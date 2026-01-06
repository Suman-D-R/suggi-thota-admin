"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Percent, Tag, Ticket } from "lucide-react"
import { Label } from "@/components/ui/label"

export function PricingManagement() {
  const [selectedStore, setSelectedStore] = useState<string>("")

  // Dummy data
  const stores = [
    { _id: "1", name: "Store 1 - Downtown" },
    { _id: "2", name: "Store 2 - Malleshwaram" },
  ]

  const storePricing = [
    {
      product: "Basmati Rice",
      variant: "RICE-1KG",
      sellingPrice: 120,
      discount: 10,
      finalPrice: 108,
    },
    {
      product: "Tomatoes",
      variant: "TOM-1KG",
      sellingPrice: 40,
      discount: 5,
      finalPrice: 38,
    },
  ]

  const offers = [
    {
      id: "1",
      type: "Percentage Discount",
      value: "20%",
      description: "20% off on all vegetables",
      storeSpecific: true,
      storeName: "Store 1",
      active: true,
    },
    {
      id: "2",
      type: "Flat Discount",
      value: "₹50",
      description: "Flat ₹50 off on orders above ₹500",
      storeSpecific: false,
      active: true,
    },
  ]

  const coupons = [
    {
      code: "WELCOME20",
      discount: "20%",
      usageLimit: 100,
      used: 45,
      expiry: "2024-12-31",
      active: true,
    },
    {
      code: "SAVE50",
      discount: "₹50",
      usageLimit: 200,
      used: 120,
      expiry: "2024-12-31",
      active: true,
    },
  ]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pricing" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pricing">Store-wise Pricing</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store-wise Pricing</CardTitle>
              <CardDescription>Manage selling prices and discounts for each store</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger className="w-full max-w-sm">
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store._id} value={store._id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Variant</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Final Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {storePricing.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {item.product} ({item.variant})
                      </TableCell>
                      <TableCell>₹{item.sellingPrice}</TableCell>
                      <TableCell>{item.discount}%</TableCell>
                      <TableCell className="font-semibold">₹{item.finalPrice}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Offers</CardTitle>
                  <CardDescription>Manage percentage discounts, flat discounts, and buy X get Y offers</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Offer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {offers.map((offer) => (
                  <Card key={offer.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={offer.active ? "default" : "secondary"}>
                            {offer.type}
                          </Badge>
                          {offer.storeSpecific && (
                            <Badge variant="outline">{offer.storeName}</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold">{offer.value}</h3>
                        <p className="text-sm text-slate-600">{offer.description}</p>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Coupons</CardTitle>
                  <CardDescription>Manage coupon codes, usage limits, and expiry</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Coupon
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon.code}>
                      <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                      <TableCell>{coupon.discount}</TableCell>
                      <TableCell>
                        {coupon.used} / {coupon.usageLimit}
                      </TableCell>
                      <TableCell>{new Date(coupon.expiry).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={coupon.active ? "default" : "secondary"}>
                          {coupon.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

