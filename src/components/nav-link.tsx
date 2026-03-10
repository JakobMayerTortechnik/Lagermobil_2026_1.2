"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import type { ComponentProps } from 'react';

type NavLinkProps = ComponentProps<typeof Link> & {
  children: React.ReactNode;
};

export default function NavLink({ href, children, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} {...props}>
      <SidebarMenuButton isActive={isActive} className="w-full justify-start">
        {children}
      </SidebarMenuButton>
    </Link>
  );
}
