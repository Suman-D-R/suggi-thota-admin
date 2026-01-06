"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Store } from "lucide-react"

export function DashboardStorePerformance() {
  // Dummy data
  const storePerformance = [
    {
      store: "Store 1 - Downtown",
      orders: 245,
      revenue: 125000,
      avgOrderValue: 510,
      growth: "+20%",
    },
    {
      store: "Store 2 - Malleshwaram",
      orders: 189,
      revenue: 98000,
      avgOrderValue: 518,
      growth: "+15%",
    },
    {
      store: "Dark Store - Warehouse",
      orders: 120,
      revenue: 60000,
      avgOrderValue: 500,
      growth: "+10%",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Store-wise Performance
        </CardTitle>
        <CardDescription>Performance metrics by store</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Avg Order Value</TableHead>
              <TableHead>Growth</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {storePerformance.map((store, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{store.store}</TableCell>
                <TableCell>{store.orders}</TableCell>
                <TableCell>₹{store.revenue.toLocaleString()}</TableCell>
                <TableCell>₹{store.avgOrderValue}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                    {store.growth}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

