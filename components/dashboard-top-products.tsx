"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp } from "lucide-react"

export function DashboardTopProducts() {
  // Dummy data
  const topProducts = [
    {
      product: "Basmati Rice",
      variant: "RICE-1KG",
      unitsSold: 450,
      revenue: 54000,
      growth: "+15%",
    },
    {
      product: "Tomatoes",
      variant: "TOM-1KG",
      unitsSold: 320,
      revenue: 12800,
      growth: "+8%",
    },
    {
      product: "Onions",
      variant: "ONI-1KG",
      unitsSold: 280,
      revenue: 11200,
      growth: "+12%",
    },
    {
      product: "Potatoes",
      variant: "POT-1KG",
      unitsSold: 250,
      revenue: 10000,
      growth: "+5%",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>Best performing products this week</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>Units Sold</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Growth</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topProducts.map((product, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{product.product}</TableCell>
                <TableCell>{product.variant}</TableCell>
                <TableCell>{product.unitsSold}</TableCell>
                <TableCell>₹{product.revenue.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <TrendingUp className="h-3 w-3" />
                    {product.growth}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

