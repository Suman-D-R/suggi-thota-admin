"use client"

import * as React from "react"
import { MoreHorizontal, Search, Filter, X, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

// Mock Data
const orders = [
  {
    id: "ORD-001",
    orderNumber: "#12345",
    customer: "Rajesh Kumar",
    email: "rajesh.kumar@email.com",
    date: "2025-01-15",
    total: 1250.50,
    status: "pending",
    items: 3,
  },
  {
    id: "ORD-002",
    orderNumber: "#12346",
    customer: "Priya Sharma",
    email: "priya.sharma@email.com",
    date: "2025-01-14",
    total: 890.00,
    status: "processing",
    items: 5,
  },
  {
    id: "ORD-003",
    orderNumber: "#12347",
    customer: "Amit Patel",
    email: "amit.patel@email.com",
    date: "2025-01-13",
    total: 2340.75,
    status: "shipped",
    items: 8,
  },
  {
    id: "ORD-004",
    orderNumber: "#12348",
    customer: "Sneha Reddy",
    email: "sneha.reddy@email.com",
    date: "2025-01-12",
    total: 567.25,
    status: "delivered",
    items: 2,
  },
  {
    id: "ORD-005",
    orderNumber: "#12349",
    customer: "Vikram Singh",
    email: "vikram.singh@email.com",
    date: "2025-01-11",
    total: 1890.00,
    status: "delivered",
    items: 6,
  },
  {
    id: "ORD-006",
    orderNumber: "#12350",
    customer: "Anjali Mehta",
    email: "anjali.mehta@email.com",
    date: "2025-01-10",
    total: 450.00,
    status: "cancelled",
    items: 1,
  },
]

const statusColors = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
  processing: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  shipped: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  cancelled: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
}

export function OrderTable() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const hasActiveFilters = statusFilter !== "all" || searchTerm !== ""

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <Card className="border-none shadow-md bg-white overflow-hidden">
      <div className="p-6 space-y-4 border-b border-slate-100">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders, customer, email..."
              className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200 focus:ring-emerald-500">
                <div className="flex items-center gap-2 text-slate-600">
                  <Filter className="h-3.5 w-3.5" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                onClick={clearFilters}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="w-[120px] text-xs font-semibold uppercase tracking-wider text-slate-500 pl-6 h-12">
                Order
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 h-12">
                Customer
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 h-12">
                Date
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 h-12">
                Items
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 h-12">
                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700 group">
                  Total <ArrowUpDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
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
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <TableRow
                  key={order.id}
                  className="group hover:bg-slate-50/80 transition-colors border-slate-100 cursor-pointer"
                >
                  <TableCell className="pl-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-slate-900">{order.orderNumber}</span>
                      <span className="text-xs text-slate-500 font-mono">{order.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-slate-900">{order.customer}</span>
                      <span className="text-xs text-slate-500">{order.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">{formatDate(order.date)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-700 font-medium">{order.items} items</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-sm text-slate-900">₹{order.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`${statusColors[order.status as keyof typeof statusColors]} font-normal shadow-none`}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">View details</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">Edit order</DropdownMenuItem>
                        {order.status === "pending" && (
                          <DropdownMenuItem className="cursor-pointer">Mark as processing</DropdownMenuItem>
                        )}
                        {order.status === "processing" && (
                          <DropdownMenuItem className="cursor-pointer">Mark as shipped</DropdownMenuItem>
                        )}
                        {order.status === "shipped" && (
                          <DropdownMenuItem className="cursor-pointer">Mark as delivered</DropdownMenuItem>
                        )}
                        {order.status !== "cancelled" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                              Cancel order
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="h-8 w-8 text-slate-300" />
                    <p className="text-sm text-slate-500">No orders found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}

