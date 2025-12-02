import type { Metadata } from 'next';
import { HeroBannerTable } from '@/components/hero-banner-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hero Banners | Suggi Thota Admin',
  description: 'Manage hero banner carousel',
};

export default function HeroBannersPage() {
  return (
    <div className='min-h-screen flex flex-col bg-slate-50/50'>
      <main className='flex-1 container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8'>
          <div className='space-y-1'>
            <h1 className='text-3xl font-bold tracking-tight text-slate-900'>
              Hero Banners
            </h1>
            <p className='text-muted-foreground text-sm sm:text-base'>
              Manage hero banner carousel for the home page.
            </p>
          </div>
          <Link href="/hero-banners/new">
            <Button
              size='lg'
              className='bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:shadow-md cursor-pointer'
            >
              <Plus className='mr-2 h-5 w-5' />
              Add Hero Banner
            </Button>
          </Link>
        </div>

        <div className='space-y-6'>
          <HeroBannerTable />
        </div>
      </main>
    </div>
  );
}

