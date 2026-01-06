"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Truck, MapPin, Clock } from "lucide-react"

export function DeliveryManagement() {
  // Dummy data
  const deliveryPartners = [
    {
      id: "1",
      name: "Rajesh Kumar",
      phone: "+91 98765 43210",
      status: "active",
      ordersDelivered: 245,
      rating: 4.8,
      onDuty: true,
    },
    {
      id: "2",
      name: "Priya Sharma",
      phone: "+91 98765 43211",
      status: "active",
      ordersDelivered: 189,
      rating: 4.9,
      onDuty: false,
    },
    {
      id: "3",
      name: "Amit Patel",
      phone: "+91 98765 43212",
      status: "inactive",
      ordersDelivered: 156,
      rating: 4.6,
      onDuty: false,
    },
  ]

  const deliveryZones = [
    {
      id: "1",
      name: "Zone A - Downtown",
      store: "Store 1",
      radius: "5 km",
      avgDeliveryTime: "25 min",
      active: true,
    },
    {
      id: "2",
      name: "Zone B - Malleshwaram",
      store: "Store 2",
      radius: "7 km",
      avgDeliveryTime: "30 min",
      active: true,
    },
  ]

  const pendingAssignments = [
    {
      orderId: "ORD-001",
      customer: "John Doe",
      address: "123 Main St",
      estimatedTime: "25 min",
      status: "pending",
    },
    {
      orderId: "ORD-002",
      customer: "Jane Smith",
      address: "456 Park Ave",
      estimatedTime: "30 min",
      status: "pending",
    },
  ]

  return (
    <div className="space-y-6">
      <Tabs defaultValue="partners" className="space-y-4">
        <TabsList>
          <TabsTrigger value="partners">Delivery Partners</TabsTrigger>
          <TabsTrigger value="assignments">Order Assignment</TabsTrigger>
          <TabsTrigger value="zones">Delivery Zones</TabsTrigger>
          <TabsTrigger value="eta">ETA Management</TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Delivery Partners</CardTitle>
                  <CardDescription>Manage delivery partners and their performance</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Partner
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Orders Delivered</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>On Duty</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryPartners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell className="font-medium">{partner.name}</TableCell>
                      <TableCell>{partner.phone}</TableCell>
                      <TableCell>
                        <Badge variant={partner.status === "active" ? "default" : "secondary"}>
                          {partner.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{partner.ordersDelivered}</TableCell>
                      <TableCell>{partner.rating} ⭐</TableCell>
                      <TableCell>
                        <Badge variant={partner.onDuty ? "default" : "outline"}>
                          {partner.onDuty ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Assignment</CardTitle>
              <CardDescription>Assign orders to delivery partners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingAssignments.map((order) => (
                  <Card key={order.orderId} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{order.orderId}</span>
                          <Badge variant="outline">{order.status}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">Customer: {order.customer}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="h-4 w-4" />
                          {order.address}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="h-4 w-4" />
                          ETA: {order.estimatedTime}
                        </div>
                      </div>
                      <Button>Assign Partner</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Delivery Zones</CardTitle>
                  <CardDescription>Manage delivery zones and service areas</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Zone
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zone Name</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Radius</TableHead>
                    <TableHead>Avg Delivery Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryZones.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">{zone.name}</TableCell>
                      <TableCell>{zone.store}</TableCell>
                      <TableCell>{zone.radius}</TableCell>
                      <TableCell>{zone.avgDeliveryTime}</TableCell>
                      <TableCell>
                        <Badge variant={zone.active ? "default" : "secondary"}>
                          {zone.active ? "Active" : "Inactive"}
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

        <TabsContent value="eta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ETA Management</CardTitle>
              <CardDescription>Configure estimated delivery times by zone and distance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  ETA configuration will be available here. This will allow you to set estimated delivery times
                  based on zone, distance, and time of day.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

