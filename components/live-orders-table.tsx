"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Package, Truck, User, MapPin, CreditCard } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { orderAPI } from "@/lib/api"

interface LiveOrder {
  id: string
  orderNumber: string
  customer: {
    name: string
    phone: string
    email: string
  }
  items: Array<{
    product: string
    variant: string
    quantity: number
    price: number
  }>
  total: number
  status: "pending" | "picking" | "packing" | "out_for_delivery" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  paymentStatus: "paid" | "pending" | "failed"
  deliveryPartner?: string
  deliveryAddress?: any
  timeElapsed: string
  store: string
}

export function LiveOrdersTable() {
  const [liveOrders, setLiveOrders] = React.useState<LiveOrder[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      // Get live orders (pending, confirmed, preparing, ready, out_for_delivery)
      const response = await orderAPI.getAll({
        page: 1,
        limit: 100,
        status: undefined, // Get all statuses, we'll filter client-side
      })
      
      if (response.success && response.data) {
        const allOrders = response.data
        // Filter for live orders (not delivered, cancelled, or refunded)
        const liveStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery']
        const filtered = allOrders.filter((order: any) => 
          liveStatuses.includes(order.status?.toLowerCase())
        )
        
        setLiveOrders(filtered.map((order: any) => ({
          id: order.id || order._id,
          orderNumber: order.orderNumber || `#${order._id?.slice(-6)}`,
          customer: {
            name: order.customer?.name || 'Unknown',
            phone: order.customer?.phone || '',
            email: order.customer?.email || '',
          },
          items: order.items || [],
          total: order.total || 0,
          status: order.status?.toLowerCase() || 'pending',
          paymentStatus: order.paymentStatus?.toLowerCase() || 'pending',
          deliveryPartner: order.deliveryPartner,
          deliveryAddress: order.deliveryAddress,
          timeElapsed: order.timeElapsed || '0 min',
          store: order.store || 'Unknown Store',
        })))
      }
    } catch (err: any) {
      console.error('Failed to load orders:', err)
      setError(err.message || 'Failed to load orders')
      setLiveOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  // Dummy data fallback (for development/testing)
  const dummyOrders: LiveOrder[] = [
    {
      id: "1",
      orderNumber: "#12345",
      customer: {
        name: "Rajesh Kumar",
        phone: "+91 98765 43210",
        email: "rajesh@example.com",
      },
      items: [
        { product: "Basmati Rice", variant: "RICE-1KG", quantity: 2, price: 120 },
        { product: "Tomatoes", variant: "TOM-1KG", quantity: 1, price: 40 },
      ],
      total: 280,
      status: "picking",
      paymentStatus: "paid",
      timeElapsed: "5 min",
      store: "Store 1 - Downtown",
    },
    {
      id: "2",
      orderNumber: "#12346",
      customer: {
        name: "Priya Sharma",
        phone: "+91 98765 43211",
        email: "priya@example.com",
      },
      items: [
        { product: "Onions", variant: "ONI-1KG", quantity: 3, price: 40 },
      ],
      total: 120,
      status: "packing",
      paymentStatus: "paid",
      timeElapsed: "12 min",
      store: "Store 2 - Malleshwaram",
    },
    {
      id: "3",
      orderNumber: "#12347",
      customer: {
        name: "Amit Patel",
        phone: "+91 98765 43212",
        email: "amit@example.com",
      },
      items: [
        { product: "Potatoes", variant: "POT-1KG", quantity: 2, price: 50 },
      ],
      total: 100,
      status: "out_for_delivery",
      paymentStatus: "paid",
      deliveryPartner: "Rajesh Kumar",
      timeElapsed: "25 min",
      store: "Store 1 - Downtown",
    },
    {
      id: "4",
      orderNumber: "#12348",
      customer: {
        name: "Sneha Reddy",
        phone: "+91 98765 43213",
        email: "sneha@example.com",
      },
      items: [
        { product: "Basmati Rice", variant: "RICE-1KG", quantity: 1, price: 120 },
      ],
      total: 120,
      status: "pending",
      paymentStatus: "pending",
      timeElapsed: "2 min",
      store: "Store 1 - Downtown",
    },
  ]

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700", icon: Clock },
    preparing: { label: "Preparing", color: "bg-purple-100 text-purple-700", icon: Package },
    ready: { label: "Ready", color: "bg-indigo-100 text-indigo-700", icon: Package },
    picking: { label: "Picking", color: "bg-blue-100 text-blue-700", icon: Package },
    packing: { label: "Packing", color: "bg-purple-100 text-purple-700", icon: Package },
    out_for_delivery: { label: "Out for Delivery", color: "bg-green-100 text-green-700", icon: Truck },
  }

  const displayOrders = liveOrders.length > 0 ? liveOrders : (isLoading ? [] : dummyOrders)

  if (isLoading) {
    return (
      <Card className="border-none shadow-md bg-white overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-slate-500">Loading orders...</p>
        </div>
      </Card>
    )
  }

  if (error && liveOrders.length === 0) {
    return (
      <Card className="border-none shadow-md bg-white overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadOrders} variant="outline">Retry</Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-md bg-white overflow-hidden">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 pl-6 h-12">
                Order
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 h-12">
                Customer
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 h-12">
                Items
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 h-12">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 h-12">
                Payment
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 h-12">
                Delivery Partner
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 h-12">
                Time
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-right pr-6 h-12">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <p className="text-sm text-slate-500">No live orders found.</p>
                </TableCell>
              </TableRow>
            ) : (
              displayOrders.map((order) => {
                const config = statusConfig[order.status] || statusConfig.pending
              return (
                <TableRow key={order.id} className="hover:bg-slate-50/80 transition-colors border-slate-100">
                  <TableCell className="pl-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-slate-900">{order.orderNumber}</span>
                      <span className="text-xs text-slate-500">{order.store}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-slate-900">{order.customer.name}</span>
                      <span className="text-xs text-slate-500">{order.customer.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-700">{order.items.length} items</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`${config.color} font-normal shadow-none`}>
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        order.paymentStatus === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.paymentStatus === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {order.deliveryPartner ? (
                      <span className="text-sm text-slate-700">{order.deliveryPartner}</span>
                    ) : (
                      <Button variant="outline" size="sm">Assign</Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">{order.timeElapsed}</span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">View Details</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Order Details - {order.orderNumber}</DialogTitle>
                          <DialogDescription>Complete order information</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Customer Info
                            </h3>
                            <div className="space-y-1 text-sm">
                              <p><span className="font-medium">Name:</span> {order.customer.name}</p>
                              <p><span className="font-medium">Phone:</span> {order.customer.phone || 'N/A'}</p>
                              <p><span className="font-medium">Email:</span> {order.customer.email || 'N/A'}</p>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Delivery Address
                            </h3>
                            <div className="text-sm text-slate-600">
                              {order.deliveryAddress ? (
                                typeof order.deliveryAddress === 'string' ? (
                                  <p>{order.deliveryAddress}</p>
                                ) : (
                                  <div>
                                    {(order.deliveryAddress as any).label && (
                                      <p className="font-medium">{(order.deliveryAddress as any).label}</p>
                                    )}
                                    <p>{(order.deliveryAddress as any).street || ''}</p>
                                    <p>
                                      {(order.deliveryAddress as any).city || ''}
                                      {(order.deliveryAddress as any).state ? `, ${(order.deliveryAddress as any).state}` : ''}
                                      {(order.deliveryAddress as any).pincode ? ` - ${(order.deliveryAddress as any).pincode}` : ''}
                                    </p>
                                    {(order.deliveryAddress as any).contactName && (
                                      <p className="mt-1">
                                        <span className="font-medium">Contact:</span> {(order.deliveryAddress as any).contactName}
                                        {(order.deliveryAddress as any).contactPhone ? ` - ${(order.deliveryAddress as any).contactPhone}` : ''}
                                      </p>
                                    )}
                                  </div>
                                )
                              ) : (
                                <p className="text-slate-400">Address not available</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Items
                            </h3>
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm border-b pb-2">
                                  <span>{item.product} ({item.variant}) x {item.quantity}</span>
                                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between font-semibold pt-2">
                                <span>Total</span>
                                <span>₹{order.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Payment Status
                            </h3>
                            <Badge
                              variant="secondary"
                              className={
                                order.paymentStatus === "paid"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : order.paymentStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }
                            >
                              {order.paymentStatus}
                            </Badge>
                          </div>
                          {order.deliveryPartner && (
                            <div>
                              <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                Delivery Partner
                              </h3>
                              <p className="text-sm">{order.deliveryPartner}</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              )
            }))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

