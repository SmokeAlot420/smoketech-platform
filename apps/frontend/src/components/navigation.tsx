'use client';

/**
 * Global Navigation Component
 *
 * Provides navigation between main app sections:
 * - Home (Quick Generation)
 * - Character Library
 * - Workflow Generator
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Workflow, Video } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      description: 'Quick Generation'
    },
    {
      href: '/character-library',
      label: 'Character Library',
      icon: Users,
      description: '4-Shot Generator'
    },
    {
      href: '/workflow-generator',
      label: 'Workflow',
      icon: Workflow,
      description: 'Template Builder'
    },
    {
      href: '/generated-videos',
      label: 'Generated Videos',
      icon: Video,
      description: 'VEO3 Gallery'
    }
  ];

  return (
    <nav className="border-b border-gray-100 dark:border-slate-800/50 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 border-b-2 transition-colors whitespace-nowrap
                  ${isActive
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-400/30'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-gray-500">{item.description}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
