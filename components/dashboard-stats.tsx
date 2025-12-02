'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';
import { ArrowUp } from 'lucide-react';

const stats = [
  {
    title: 'Total Revenue',
    value: '₹45,231.89',
    change: '+20.1% from last month',
    icon: DollarSign,
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Orders',
    value: '+2350',
    change: '+180.1% from last month',
    icon: ShoppingCart,
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Products',
    value: '+12,234',
    change: '+19% from last month',
    icon: Package,
    iconColor: 'text-emerald-600',
  },
  {
    title: 'Active Users',
    value: '+573',
    change: '+201 since last hour',
    icon: Users,
    iconColor: 'text-emerald-600',
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
