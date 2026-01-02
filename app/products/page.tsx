import type { Metadata } from 'next';
import { ProductTable } from '@/components/product-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Products | Vitura Admin',
  description: 'Manage your product catalog',
};

export default function ProductsPage() {
  return (
    <div className='min-h-screen flex flex-col bg-slate-50/50'>
      <main className='flex-1 container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8'>
          <div className='space-y-1'>
            <h1 className='text-3xl font-bold tracking-tight text-slate-900'>
              Products
            </h1>
            <p className='text-muted-foreground text-sm sm:text-base'>
              Manage and organize your product catalog efficiently.
            </p>
          </div>
          <Link href="/products/new">
            <Button
              size='lg'
              className='bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:shadow-md cursor-pointer'
            >
              <Plus className='mr-2 h-5 w-5' />
              Add Product
            </Button>
          </Link>
        </div>

        <div className='space-y-6'>
          <ProductTable />
        </div>
      </main>
    </div>
  );
}
