import type { Metadata } from 'next';
import { StoreDetailManagement } from '@/components/store-detail-management';

export const metadata: Metadata = {
  title: 'Store Management | Vitura Admin',
  description: 'Manage store products, variants, and inventory',
};

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Validate the ID format (MongoDB ObjectId is 24 hex characters)
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return (
      <div className='min-h-screen flex flex-col bg-slate-50/50'>
        <main className='flex-1 container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
          <div className="text-center py-12">
            <p className="text-red-600">Invalid store ID format</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex flex-col bg-slate-50/50'>
      <main className='flex-1 container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        <StoreDetailManagement storeId={id} />
      </main>
    </div>
  );
}

