"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookUser, Calendar, Car, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/orders', label: 'Aufträge', icon: BookUser },
  { href: '/calendar', label: 'Kalender', icon: Calendar },
  { href: '/vehicle/stock', label: 'Fahrzeug', icon: Car },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isVehicleSection = pathname.startsWith('/vehicle');
  
  // This function checks if a nav item should be considered active.
  // It handles the base path and any sub-paths.
  const isNavItemActive = (href: string) => {
    if (href === '/vehicle/stock') return isVehicleSection;
    if (href === '/orders') return pathname.startsWith('/orders');
    return pathname === href;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <main className="flex-1 overflow-y-auto pb-16">
        {children}
      </main>
      <footer className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm z-20">
        <nav className="flex items-center justify-around h-16">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = isNavItemActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 text-xs font-medium w-full h-full',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="size-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </footer>
    </div>
  );
}
