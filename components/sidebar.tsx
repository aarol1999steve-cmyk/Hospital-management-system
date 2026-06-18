'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  Receipt,
  FileText,
  Bell,
  Settings,
  Pill,
  Building2,
  ChevronLeft,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { UserRole } from '@/lib/types';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'doctor', 'receptionist'],
  },
  {
    title: 'Patients',
    href: '/patients',
    icon: Users,
    roles: ['admin', 'doctor', 'receptionist'],
  },
  {
    title: 'Appointments',
    href: '/appointments',
    icon: CalendarDays,
    roles: ['admin', 'doctor', 'receptionist'],
  },
  {
    title: 'Doctors',
    href: '/doctors',
    icon: Stethoscope,
    roles: ['admin', 'receptionist'],
  },
  {
    title: 'Departments',
    href: '/departments',
    icon: Building2,
    roles: ['admin'],
  },
  {
    title: 'Medical Records',
    href: '/medical-records',
    icon: FileText,
    roles: ['admin', 'doctor'],
  },
  {
    title: 'Prescriptions',
    href: '/prescriptions',
    icon: Pill,
    roles: ['admin', 'doctor'],
  },
  {
    title: 'Billing',
    href: '/billing',
    icon: Receipt,
    roles: ['admin', 'receptionist'],
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: Activity,
    roles: ['admin'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNavItems = navItems.filter(
    item => profile && item.roles.includes(profile.role)
  );

  const getHref = (href: string) => {
    if (href === '/dashboard') {
      return `/${profile?.role}/dashboard`;
    }
    return `/${profile?.role}${href}`;
  };

  const isActive = (href: string) => {
    const fullPath = getHref(href);
    return pathname === fullPath || pathname?.startsWith(fullPath + '/');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        <Link href={`/${profile?.role}/dashboard`} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-lg text-primary">MediCare</span>
          )}
        </Link>
      </div>

      <nav className="flex flex-col gap-1 p-2">
        {filteredNavItems.map((item) => (
          <Link
            key={item.href}
            href={getHref(item.href)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive(item.href)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-16 left-0 right-0 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
