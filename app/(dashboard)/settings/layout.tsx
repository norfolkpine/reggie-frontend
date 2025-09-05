"use client";

import React from 'react'
import {
  IconBrowserCheck,
  IconNotification,
  IconPalette,
  IconUser,
  IconCreditCard,
  IconLayoutList,
  IconGauge,
  IconMail,
  IconLock,
  IconDeviceLaptop,
  IconBuilding,
} from '@tabler/icons-react'
import SidebarNav from './components/sidebar-nav'
import { useHeader } from '@/contexts/header-context';
import { useMemo } from 'react';
import { useEffect } from 'react';

const sidebarNavItems = [
  {
    title: 'Profile',
    icon: <IconUser size={18} />,
    href: '/settings',
  },
  {
    title: 'Appearance',
    icon: <IconPalette size={18} />,
    href: '/settings/appearance',
  },
  {
    title: 'Notifications',
    icon: <IconNotification size={18} />,
    href: '/settings/notifications',
  },
  {
    title: 'Display',
    icon: <IconBrowserCheck size={18} />,
    href: '/settings/display',
  },
  {
    title: 'Billing and plans',
    icon: <IconCreditCard size={18} />,
    href: '/settings/billing',
    sub: [
      {
        title: 'Plans and usage',
        label: '',
        href: '/settings/billing/plans-usage',
        icon: <IconLayoutList size={18} />,
      },
      {
        title: 'Spending limits',
        label: '',
        href: '/settings/billing/spending-limits',
        icon: <IconGauge size={18} />,
      },
      {
        title: 'Payment information',
        label: '',
        href: '/settings/billing/payment-information',
        icon: <IconCreditCard size={18} />,
      },
    ]
  },
  {
    title: 'Password and MFA',
    icon: <IconLock size={18} />,
    href: '/settings/password-authentication',
  },
  {
    title: 'Teams',
    icon: <IconBuilding size={18} />,
    href: '/settings/teams',
  }
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { setHeaderCustomContent } = useHeader()

    const headerContent = useMemo(() => (
    <div className="text-lg font-medium ">
      Settings
    </div>
  ), []);

  // Set custom header content
  useEffect(() => {
    setHeaderCustomContent(headerContent);

    // Cleanup when component unmounts
    return () => setHeaderCustomContent(null);
  }, [setHeaderCustomContent, headerContent]);
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
       
        <div className='flex flex-1 flex-col space-y-8 md:space-y-2 md:overflow-hidden lg:flex-row lg:space-x-12 lg:space-y-0'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex w-full p-1 pr-4 md:overflow-y-hidden'>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}