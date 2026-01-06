"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { XCircle, RefreshCw } from "lucide-react"

interface CancelledOrder {
  id: string
  orderNumber: string
  customer: string
  date: string
  total: number
  reason: string
  refundStatus: "pending" | "processed" | "failed"
}

export function CancelledOrdersTable() {
  // Dummy data
  const cancelledOrders: CancelledOrder[] = [
    {
      id: "1",
      orderNumber: "#12350",
      customer: "Anjali Mehta",
      date: "2025-01-10",
      total: 450,
      reason: "Customer cancelled",
      refundStatus: "processed",
    },
    {
      id: "2",
      orderNumber: "#12349",
      customer: "Vikram Singh",
      date: "2025-01-09",
      total: 1890,
      reason: "Payment failed",
      refundStatus: "pending",
    },
    {
      id: "3",
      orderNumber: "#12348",
      customer: "Sneha Reddy",
      date: "2025-01-08",
      total: 567,
      reason: "Out of stock",
      refundStatus: "processed",
    },
  ]

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
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-right pr-6 h-12">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cancelledOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
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
                    <span className="font-medium text-sm text-slate-900">₹{order.total}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">{order.reason}</span>
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
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      {order.refundStatus === "pending" && (
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

