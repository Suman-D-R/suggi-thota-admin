import type { Metadata } from 'next';
import { InventoryManagement } from '@/components/inventory-management';
import { AuthGuard } from '@/components/auth-guard';

export const metadata: Metadata = {
  title: 'Inventory Management | Vitura Admin',
  description: 'Manage inventory, batches, and stock levels',
};

export default function InventoryPage() {
  return (
    <AuthGuard>
      <div className='min-h-screen flex flex-col bg-slate-50/50'>
        <main className='flex-1 container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8'>
            <div className='space-y-1'>
              <h1 className='text-3xl font-bold tracking-tight text-slate-900'>
                Inventory Management
              </h1>
              <p className='text-muted-foreground text-sm sm:text-base'>
                Manage inventory, batches, and stock levels across stores
              </p>
            </div>
          </div>

          <div className='space-y-6'>
            <InventoryManagement />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

