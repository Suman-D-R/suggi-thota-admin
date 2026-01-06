"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, TrendingUp, Package, DollarSign, Clock } from "lucide-react"

export function ReportsAnalytics() {
  // Dummy data
  const salesReport = [
    {
      store: "Store 1 - Downtown",
      totalSales: 125000,
      orders: 245,
      avgOrderValue: 510,
      profit: 25000,
      margin: 20,
    },
    {
      store: "Store 2 - Malleshwaram",
      totalSales: 98000,
      orders: 189,
      avgOrderValue: 518,
      profit: 19600,
      margin: 20,
    },
  ]

  const productWiseSales = [
    {
      product: "Basmati Rice",
      variant: "RICE-1KG",
      unitsSold: 450,
      revenue: 54000,
      profit: 9000,
    },
    {
      product: "Tomatoes",
      variant: "TOM-1KG",
      unitsSold: 320,
      revenue: 12800,
      profit: 2560,
    },
  ]

  const inventoryReport = [
    {
      product: "Basmati Rice",
      variant: "RICE-1KG",
      currentStock: 45,
      lowStockThreshold: 20,
      status: "Normal",
    },
    {
      product: "Tomatoes",
      variant: "TOM-1KG",
      currentStock: 8,
      lowStockThreshold: 20,
      status: "Low Stock",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2,23,000</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">434</div>
            <p className="text-xs text-muted-foreground">+15.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹514</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Fulfillment</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">27 min</div>
            <p className="text-xs text-muted-foreground">-2 min from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
          <TabsTrigger value="profit">Profit & Margin</TabsTrigger>
          <TabsTrigger value="fulfillment">Order Fulfillment</TabsTrigger>
          <TabsTrigger value="wastage">Loss / Wastage</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sales Report</CardTitle>
                  <CardDescription>Store-wise and product-wise sales performance</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="month">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Store-wise Sales</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Store</TableHead>
                        <TableHead>Total Sales</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Avg Order Value</TableHead>
                        <TableHead>Profit</TableHead>
                        <TableHead>Margin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesReport.map((store, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{store.store}</TableCell>
                          <TableCell>₹{store.totalSales.toLocaleString()}</TableCell>
                          <TableCell>{store.orders}</TableCell>
                          <TableCell>₹{store.avgOrderValue}</TableCell>
                          <TableCell>₹{store.profit.toLocaleString()}</TableCell>
                          <TableCell>{store.margin}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Product-wise Sales</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Variant</TableHead>
                        <TableHead>Units Sold</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Profit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productWiseSales.map((product, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{product.product}</TableCell>
                          <TableCell>{product.variant}</TableCell>
                          <TableCell>{product.unitsSold}</TableCell>
                          <TableCell>₹{product.revenue.toLocaleString()}</TableCell>
                          <TableCell>₹{product.profit.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Report</CardTitle>
              <CardDescription>Current stock levels and low stock alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Low Stock Threshold</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryReport.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.product}</TableCell>
                      <TableCell>{item.variant}</TableCell>
                      <TableCell>{item.currentStock}</TableCell>
                      <TableCell>{item.lowStockThreshold}</TableCell>
                      <TableCell>
                        <span className={item.status === "Low Stock" ? "text-red-600 font-semibold" : ""}>
                          {item.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Margin Report</CardTitle>
              <CardDescription>Profit margins and cost analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Profit and margin analysis will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fulfillment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Fulfillment Time</CardTitle>
              <CardDescription>Average time to fulfill orders</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Order fulfillment time metrics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wastage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loss / Wastage Report</CardTitle>
              <CardDescription>Track product wastage and losses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Wastage and loss reports will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

