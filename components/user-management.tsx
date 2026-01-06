"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, User, Shield, Wallet, ShoppingBag, Ban } from "lucide-react"
import { userAPI } from "@/lib/api"

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("")

  // Dummy data
  const customers = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+91 98765 43210",
      orders: 12,
      totalSpent: 4500,
      walletBalance: 250,
      status: "active",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+91 98765 43211",
      orders: 8,
      totalSpent: 3200,
      walletBalance: 150,
      status: "active",
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      phone: "+91 98765 43212",
      orders: 0,
      totalSpent: 0,
      walletBalance: 0,
      status: "blocked",
    },
  ]

  const adminUsers = [
    {
      id: "1",
      name: "Admin User",
      email: "admin@vitura.com",
      role: "Super Admin",
      permissions: ["All"],
      lastLogin: "2024-01-15 10:30 AM",
    },
    {
      id: "2",
      name: "Store Manager",
      email: "manager@vitura.com",
      role: "Store Manager",
      permissions: ["Store Management", "Inventory"],
      lastLogin: "2024-01-15 09:15 AM",
    },
    {
      id: "3",
      name: "Inventory Manager",
      email: "inventory@vitura.com",
      role: "Inventory Manager",
      permissions: ["Inventory Management"],
      lastLogin: "2024-01-14 05:20 PM",
    },
  ]

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
  )

  return (
    <div className="space-y-6">
      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="admins">Admin Users</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customers</CardTitle>
              <CardDescription>Manage customer accounts, orders, and wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{customer.email}</div>
                          <div className="text-xs text-slate-500">{customer.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.orders}</TableCell>
                      <TableCell>₹{customer.totalSpent}</TableCell>
                      <TableCell>₹{customer.walletBalance}</TableCell>
                      <TableCell>
                        <Badge variant={customer.status === "active" ? "default" : "destructive"}>
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <ShoppingBag className="mr-1 h-3 w-3" />
                            Orders
                          </Button>
                          <Button variant="outline" size="sm">
                            <Wallet className="mr-1 h-3 w-3" />
                            Wallet
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={customer.status === "active" ? "text-red-600" : "text-green-600"}
                          >
                            <Ban className="mr-1 h-3 w-3" />
                            {customer.status === "active" ? "Block" : "Unblock"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>Manage admin users, roles, and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminUsers.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Shield className="mr-1 h-3 w-3" />
                          {admin.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {admin.permissions.map((perm, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{admin.lastLogin}</TableCell>
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
      </Tabs>
    </div>
  )
}

