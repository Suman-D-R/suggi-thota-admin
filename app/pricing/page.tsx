import type { Metadata } from 'next';
import { PricingManagement } from '@/components/pricing-management';

export const metadata: Metadata = {
  title: 'Pricing & Offers | Vitura Admin',
  description: 'Manage store-wise pricing, offers, and coupons',
};

export default function PricingPage() {
  return (
    <div className='min-h-screen flex flex-col bg-slate-50/50'>
      <main className='flex-1 container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8'>
          <div className='space-y-1'>
            <h1 className='text-3xl font-bold tracking-tight text-slate-900'>
              Pricing & Offers
            </h1>
            <p className='text-muted-foreground text-sm sm:text-base'>
              Manage store-wise pricing, discounts, offers, and coupons
            </p>
          </div>
        </div>

        <div className='space-y-6'>
          <PricingManagement />
        </div>
      </main>
    </div>
  );
}

