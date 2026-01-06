"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowRight } from "lucide-react"
import Link from "next/link"

export function DashboardLowStock() {
  // Dummy data
  const lowStockItems = [
    {
      id: "1",
      product: "Tomatoes",
      variant: "TOM-1KG",
      store: "Store 1",
      currentStock: 8,
      threshold: 20,
    },
    {
      id: "2",
      product: "Onions",
      variant: "ONI-1KG",
      store: "Store 2",
      currentStock: 12,
      threshold: 20,
    },
    {
      id: "3",
      product: "Potatoes",
      variant: "POT-1KG",
      store: "Store 1",
      currentStock: 15,
      threshold: 20,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Products that need restocking</CardDescription>
          </div>
          <Link href="/inventory">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{item.product}</p>
                <p className="text-sm text-slate-600">
                  {item.variant} • {item.store}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="destructive">
                  {item.currentStock} left
                </Badge>
                <Button variant="outline" size="sm">Restock</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

