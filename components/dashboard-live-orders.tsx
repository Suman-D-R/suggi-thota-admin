"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Package, Truck, CheckCircle } from "lucide-react"

interface LiveOrder {
  id: string
  orderNumber: string
  customer: string
  items: number
  total: number
  status: "pending" | "picking" | "packing" | "out_for_delivery"
  timeElapsed: string
}

export function DashboardLiveOrders() {
  // Dummy data
  const liveOrders: LiveOrder[] = [
    {
      id: "1",
      orderNumber: "#12345",
      customer: "Rajesh Kumar",
      items: 3,
      total: 1250,
      status: "picking",
      timeElapsed: "5 min",
    },
    {
      id: "2",
      orderNumber: "#12346",
      customer: "Priya Sharma",
      items: 5,
      total: 890,
      status: "packing",
      timeElapsed: "12 min",
    },
    {
      id: "3",
      orderNumber: "#12347",
      customer: "Amit Patel",
      items: 2,
      total: 450,
      status: "out_for_delivery",
      timeElapsed: "25 min",
    },
    {
      id: "4",
      orderNumber: "#12348",
      customer: "Sneha Reddy",
      items: 4,
      total: 1200,
      status: "pending",
      timeElapsed: "2 min",
    },
  ]

  const statusConfig = {
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    picking: { label: "Picking", color: "bg-blue-100 text-blue-700", icon: Package },
    packing: { label: "Packing", color: "bg-purple-100 text-purple-700", icon: Package },
    out_for_delivery: { label: "Out for Delivery", color: "bg-green-100 text-green-700", icon: Truck },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Orders</CardTitle>
        <CardDescription>Real-time order status updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {liveOrders.map((order) => {
            const config = statusConfig[order.status]
            const Icon = config.icon
            return (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{order.orderNumber}</span>
                      <Badge variant="outline" className={config.color}>
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{order.customer}</p>
                    <p className="text-xs text-slate-500">
                      {order.items} items • ₹{order.total} • {order.timeElapsed} ago
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

