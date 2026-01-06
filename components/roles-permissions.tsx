"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Check, X } from "lucide-react"

export function RolesPermissions() {
  // Dummy data
  const roles = [
    {
      id: "1",
      name: "Super Admin",
      description: "Full access to all features and settings",
      permissions: {
        dashboard: true,
        catalog: true,
        stores: true,
        inventory: true,
        pricing: true,
        orders: true,
        delivery: true,
        users: true,
        reports: true,
        settings: true,
        roles: true,
      },
    },
    {
      id: "2",
      name: "Store Manager",
      description: "Manage stores, inventory, and orders",
      permissions: {
        dashboard: true,
        catalog: false,
        stores: true,
        inventory: true,
        pricing: true,
        orders: true,
        delivery: true,
        users: false,
        reports: true,
        settings: false,
        roles: false,
      },
    },
    {
      id: "3",
      name: "Inventory Manager",
      description: "Manage inventory and stock",
      permissions: {
        dashboard: true,
        catalog: false,
        stores: false,
        inventory: true,
        pricing: false,
        orders: false,
        delivery: false,
        users: false,
        reports: true,
        settings: false,
        roles: false,
      },
    },
    {
      id: "4",
      name: "Customer Support",
      description: "Handle customer orders and support",
      permissions: {
        dashboard: true,
        catalog: false,
        stores: false,
        inventory: false,
        pricing: false,
        orders: true,
        delivery: true,
        users: false,
        reports: false,
        settings: false,
        roles: false,
      },
    },
    {
      id: "5",
      name: "Delivery Ops",
      description: "Manage delivery operations",
      permissions: {
        dashboard: true,
        catalog: false,
        stores: false,
        inventory: false,
        pricing: false,
        orders: true,
        delivery: true,
        users: false,
        reports: false,
        settings: false,
        roles: false,
      },
    },
  ]

  const permissionLabels = {
    dashboard: "Dashboard",
    catalog: "Catalog Management",
    stores: "Store Management",
    inventory: "Inventory Management",
    pricing: "Pricing & Offers",
    orders: "Orders",
    delivery: "Delivery & Ops",
    users: "Users",
    reports: "Reports & Analytics",
    settings: "Settings",
    roles: "Roles & Permissions",
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Roles & Permissions</CardTitle>
          <CardDescription>Manage user roles and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Dashboard</TableHead>
                  <TableHead>Catalog</TableHead>
                  <TableHead>Stores</TableHead>
                  <TableHead>Inventory</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead>Settings</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-slate-500" />
                        {role.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{role.description}</TableCell>
                    {Object.keys(permissionLabels).map((key) => (
                      <TableCell key={key}>
                        {role.permissions[key as keyof typeof role.permissions] ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <X className="h-4 w-4 text-slate-300" />
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button variant="outline" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

