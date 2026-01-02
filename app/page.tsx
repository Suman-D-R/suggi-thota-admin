import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DashboardStats } from '@/components/dashboard-stats';
import { RevenueChart } from '@/components/revenue-chart';
import { RecentSales } from '@/components/recent-sales';
import { ProductView } from '@/components/product-view';
import { AuthGuard } from '@/components/auth-guard';

export const metadata: Metadata = {
  title: 'Dashboard | Vitura Admin',
  description: "Overview of your store's performance",
};

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className='min-h-screen flex flex-col bg-slate-50/50'>
        <main className='flex-1 container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8'>
            <div className='space-y-1'>
              <h1 className='text-3xl font-bold tracking-tight text-slate-900'>
                Dashboard
              </h1>
              <p className='text-muted-foreground text-sm sm:text-base'>
                Overview of your store's performance
              </p>
            </div>
            <Button
              size='lg'
              className='bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:shadow-md cursor-pointer'
            >
              <Download className='mr-2 h-5 w-5' />
              Download
            </Button>
          </div>

          <div className='space-y-6'>
            <DashboardStats />

            <div className='grid gap-6 md:grid-cols-2'>
              <RevenueChart />
              <RecentSales />
            </div>

            <ProductView />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
