"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { XCircle, RefreshCw } from "lucide-react"
import { orderAPI } from "@/lib/api"

interface CancelledOrder {
  id: string
  orderNumber: string
  customer: string
  date: string
  total: number
  reason: string
  refundStatus: "pending" | "processed" | "failed"
  status: string
}

export function CancelledOrdersTable() {
  const [cancelledOrders, setCancelledOrders] = React.useState<CancelledOrder[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      // Get cancelled and refunded orders
      const response = await orderAPI.getAll({
        page: 1,
        limit: 100,
        status: undefined, // Get all statuses, we'll filter client-side
      })
      
      if (response.success && response.data) {
        const allOrders = response.data
        // Filter for cancelled, refunded, or failed payment orders
        const filtered = allOrders.filter((order: any) => {
          const status = order.status?.toLowerCase()
          const paymentStatus = order.paymentStatus?.toLowerCase()
          return status === 'cancelled' || 
                 status === 'refunded' || 
                 paymentStatus === 'failed'
        })
        
        setCancelledOrders(filtered.map((order: any) => ({
          id: order.id || order._id,
          orderNumber: order.orderNumber || `#${order._id?.slice(-6)}`,
          customer: order.customer?.name || 'Unknown',
          date: order.createdAt || new Date().toISOString(),
          total: order.total || 0,
          reason: order.cancelReason || 
                 (order.paymentStatus?.toLowerCase() === 'failed' ? 'Payment Failed' : 
                 (order.status?.toLowerCase() === 'refunded' ? 'Refunded' : 'Not specified')),
          refundStatus: order.status?.toLowerCase() === 'refunded' 
            ? 'processed' 
            : (order.paymentStatus?.toLowerCase() === 'failed' ? 'pending' : 'pending') as "pending" | "processed" | "failed",
          status: order.status?.toLowerCase() || 'cancelled',
        })))
      }
    } catch (err: any) {
      console.error('Failed to load cancelled orders:', err)
      setError(err.message || 'Failed to load cancelled orders')
      setCancelledOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refresh orders every 30 seconds
  React.useEffect(() => {
    if (!isLoading) {
      const interval = setInterval(() => {
        loadOrders()
      }, 30000) // Refresh every 30 seconds

      return () => clearInterval(interval)
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <Card className="border-none shadow-md bg-white overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-slate-500">Loading cancelled orders...</p>
        </div>
      </Card>
    )
  }

  if (error && cancelledOrders.length === 0) {
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
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">Cancelled & Failed Orders</h3>
          <p className="text-xs text-slate-500 mt-1">
            {cancelledOrders.length} order{cancelledOrders.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadOrders}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
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
                Date
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 h-12">
                Total
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 h-12">
                Reason
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 h-12">
                Refund Status
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 h-12">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-right pr-6 h-12">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cancelledOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <XCircle className="h-8 w-8 text-slate-300" />
                    <p className="text-sm text-slate-500">No cancelled or failed orders.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              cancelledOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-slate-50/80 transition-colors border-slate-100">
                  <TableCell className="pl-6 py-4">
                    <span className="font-medium text-sm text-slate-900">{order.orderNumber}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-700">{order.customer}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-sm text-slate-900">₹{order.total.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">{order.reason || 'Not specified'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        order.refundStatus === "processed"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.refundStatus === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {order.refundStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        order.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : order.status === "refunded"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-slate-100 text-slate-700"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      {order.refundStatus === "pending" && order.status !== "refunded" && (
                        <Button variant="outline" size="sm">
                          <RefreshCw className="mr-1 h-3 w-3" />
                          Process Refund
                        </Button>
                      )}
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

