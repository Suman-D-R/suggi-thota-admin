import type { Metadata } from 'next';
import { OrderTable } from '@/components/order-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LiveOrdersTable } from '@/components/live-orders-table';
import { CancelledOrdersTable } from '@/components/cancelled-orders-table';

export const metadata: Metadata = {
  title: 'Orders | Vitura Admin',
  description: 'View and manage customer orders',
};

export default function OrdersPage() {
  return (
    <div className='min-h-screen flex flex-col bg-slate-50/50'>
      <main className='flex-1 container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8'>
          <div className='space-y-1'>
            <h1 className='text-3xl font-bold tracking-tight text-slate-900'>
              Orders Management
            </h1>
            <p className='text-muted-foreground text-sm sm:text-base'>
              Real-time operational view of orders, live status, and order details
            </p>
          </div>
        </div>

        <div className='space-y-6'>
          <Tabs defaultValue="live" className="space-y-4">
            <TabsList>
              <TabsTrigger value="live">Live Orders</TabsTrigger>
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled / Failed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="live" className="space-y-4">
              <LiveOrdersTable />
            </TabsContent>
            
            <TabsContent value="all" className="space-y-4">
          <OrderTable />
            </TabsContent>
            
            <TabsContent value="cancelled" className="space-y-4">
              <CancelledOrdersTable />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
