"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const sales = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "+₹1,999.00",
    initials: "OM",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "+₹39.00",
    initials: "JL",
    color: "bg-blue-100 text-blue-700",
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "+₹299.00",
    initials: "IN",
    color: "bg-orange-100 text-orange-700",
  },
  {
    name: "William Kim",
    email: "will@email.com",
    amount: "+₹99.00",
    initials: "WK",
    color: "bg-purple-100 text-purple-700",
  },
  {
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: "+₹39.00",
    initials: "SD",
    color: "bg-pink-100 text-pink-700",
  },
]

export function RecentSales() {
  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>You made 265 sales this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sales.map((sale) => (
            <div key={sale.email} className="flex items-center gap-4">
              <Avatar className={`h-10 w-10 ${sale.color} border-0`}>
                <AvatarFallback className={`${sale.color} font-semibold`}>
                  {sale.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-slate-900">{sale.name}</p>
                <p className="text-xs text-slate-500">{sale.email}</p>
              </div>
              <div className="text-sm font-medium text-emerald-600">{sale.amount}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

