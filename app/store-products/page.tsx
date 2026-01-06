import type { Metadata } from 'next';
import { StoreProductsTable } from '@/components/store-products-table';

export const metadata: Metadata = {
  title: 'Store Products | Vitura Admin',
  description: 'Manage store products with variants and pricing',
};

export default function StoreProductsPage() {
  return (
    <div className='min-h-screen flex flex-col bg-slate-50/50'>
      <main className='flex-1 container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8'>
          <div className='space-y-1'>
            <h1 className='text-3xl font-bold tracking-tight text-slate-900'>
              Store Products
            </h1>
            <p className='text-muted-foreground text-sm sm:text-base'>
              Manage products for stores with variants, pricing, and availability
            </p>
          </div>
        </div>

        <div className='space-y-6'>
          <StoreProductsTable />
        </div>
      </main>
    </div>
  );
}

