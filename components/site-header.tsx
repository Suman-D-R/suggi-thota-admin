'use client';

import * as React from 'react';
import { Leaf, LogOut, Bell, Settings, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to login page with full page reload to ensure all state is cleared
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear tokens and redirect
      window.location.href = '/login';
    }
  };

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/catalog', label: 'Catalog' },
    { href: '/inventory', label: 'Inventory' },
    { href: '/stores', label: 'Stores' },
    { href: '/store-products', label: 'Store Products' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/orders', label: 'Orders' },
    { href: '/delivery', label: 'Delivery' },
    { href: '/hero-banners', label: 'Hero Banners' },
    // { href: '/users', label: 'Users' },
    // { href: '/reports', label: 'Reports' },
    // { href: '/settings', label: 'Settings' },
  ];

  return (
    <header className='sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md supports-backdrop-filter:bg-white/60'>
      <div className='container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-8'>
          <Link
            href='/'
            className='flex items-center gap-2.5 font-bold text-xl tracking-tight text-slate-900 group'
          >
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm group-hover:bg-emerald-700 transition-colors'>
              <Leaf className='h-5 w-5' />
            </div>
            <span className='hidden sm:inline'>Vitura</span>
          </Link>

          <nav className='hidden lg:flex items-center gap-1.5'>
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                active={
                  pathname === item.href ||
                  (item.href !== '/' && pathname?.startsWith(item.href))
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant='ghost' size='icon' className='lg:hidden'>
                <Menu className='h-5 w-5' />
                <span className='sr-only'>Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='w-64'>
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>Select a page to navigate</SheetDescription>
              </SheetHeader>
              <nav className='flex flex-col gap-2 mt-6'>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${
                        pathname === item.href ||
                        (item.href !== '/' && pathname?.startsWith(item.href))
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className='flex items-center gap-2 sm:gap-3'>
          <Button
            variant='ghost'
            size='icon'
            className='text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full w-9 h-9'
          >
            <Bell className='h-4.5 w-4.5' />
            <span className='sr-only'>Notifications</span>
          </Button>

          <div className='h-5 w-px bg-slate-200 mx-1 hidden sm:block' />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='gap-2.5 pl-1.5 pr-3 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all h-10'
              >
                <Avatar className='h-7 w-7 border border-slate-200'>
                  <AvatarImage
                    src='/public/diverse-avatars.png'
                    className='object-cover'
                  />
                  <AvatarFallback className='bg-emerald-100 text-emerald-700 text-xs'>
                    AD
                  </AvatarFallback>
                </Avatar>
                <span className='hidden sm:inline-block font-medium text-sm text-slate-700'>
                  Admin
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <DropdownMenuLabel className='font-normal'>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm font-medium leading-none'>Admin User</p>
                  <p className='text-xs leading-none text-muted-foreground'>
                    admin@vitura.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='cursor-pointer'>
                <User className='mr-2 h-4 w-4 text-slate-500' /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer'>
                <Settings className='mr-2 h-4 w-4 text-slate-500' /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer'
                onClick={handleLogout}
              >
                <LogOut className='mr-2 h-4 w-4' />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`
        px-4 py-2 rounded-full text-sm font-medium transition-all
        ${
          active
            ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200/50'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }
      `}
    >
      {children}
    </Link>
  );
}
