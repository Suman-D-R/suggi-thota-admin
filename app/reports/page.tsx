import type { Metadata } from 'next';
import { ReportsAnalytics } from '@/components/reports-analytics';

export const metadata: Metadata = {
  title: 'Reports & Analytics | Vitura Admin',
  description: 'View sales, inventory, and performance reports',
};

export default function ReportsPage() {
  return (
    <div className='min-h-screen flex flex-col bg-slate-50/50'>
      <main className='flex-1 container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8'>
          <div className='space-y-1'>
            <h1 className='text-3xl font-bold tracking-tight text-slate-900'>
              Reports & Analytics
            </h1>
            <p className='text-muted-foreground text-sm sm:text-base'>
              View sales reports, inventory reports, profit margins, and analytics
            </p>
          </div>
        </div>

        <div className='space-y-6'>
          <ReportsAnalytics />
        </div>
      </main>
    </div>
  );
}

