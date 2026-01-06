import type { Metadata } from 'next';
import { UserManagement } from '@/components/user-management';

export const metadata: Metadata = {
  title: 'Users Management | Vitura Admin',
  description: 'Manage customers and admin users',
};

export default function UsersPage() {
  return (
    <div className='min-h-screen flex flex-col bg-slate-50/50'>
      <main className='flex-1 container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8'>
          <div className='space-y-1'>
            <h1 className='text-3xl font-bold tracking-tight text-slate-900'>
              Users Management
            </h1>
            <p className='text-muted-foreground text-sm sm:text-base'>
              Manage customers, admin users, roles, and permissions
            </p>
          </div>
        </div>

        <div className='space-y-6'>
          <UserManagement />
        </div>
      </main>
    </div>
  );
}

