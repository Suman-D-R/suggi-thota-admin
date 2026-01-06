'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Package, AlertTriangle, TrendingUp, Store, XCircle } from 'lucide-react';
import { ArrowUp } from 'lucide-react';

const stats = [
  {
    title: "Today's Orders",
    value: '24',
    change: '+5 from yesterday',
    icon: ShoppingCart,
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Live Orders',
    value: '8',
    change: 'In progress',
    icon: TrendingUp,
    iconColor: 'text-blue-600',
  },
  {
    title: "Today's Revenue",
    value: '₹45,231',
    change: '+20.1% from yesterday',
    icon: DollarSign,
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Low Stock Alerts',
    value: '5',
    change: 'Products need attention',
    icon: AlertTriangle,
    iconColor: 'text-orange-600',
  },
];

export function DashboardStats() {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className='bg-white border-slate-200 shadow-sm'
          >
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-slate-600'>
                    {stat.title}
                  </p>
                  <p className='text-2xl font-bold text-slate-900'>
                    {stat.value}
                  </p>
                  <div className='flex items-center gap-1 text-sm text-emerald-600'>
                    <ArrowUp className='h-3 w-3' />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div
                  className={`h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center ${stat.iconColor}`}
                >
                  <Icon className='h-6 w-6' />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
