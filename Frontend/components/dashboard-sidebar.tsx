'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Zap,
  Brain,
  Trophy,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Code,
  User,
  BookOpen,
  Gamepad2,
} from 'lucide-react';

const mainMenuItems = [
  { label: 'Dashboard', icon: Home, href: '/dashboard' },
  { label: 'Battle Arena', icon: Zap, href: '/battles' },
  { label: 'Interview Simulator', icon: Brain, href: '/interviews' },
  { label: 'Competitions', icon: Gamepad2, href: '/competitions' },
  { label: 'Leaderboards', icon: Trophy, href: '/leaderboards' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { label: 'Community', icon: Users, href: '/community' },
  { label: 'Resources', icon: BookOpen, href: '/resources' },
];

const secondaryMenuItems = [
  { label: 'Profile', icon: User, href: '/profile' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

function DashboardSidebarComponent() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border/30 bg-card/50 h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 p-6 border-b border-border/30">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <Code className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg">EduPlatform</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Main Menu */}
        <div className="space-y-1">
          {mainMenuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start gap-3 ${
                    isActive
                      ? 'bg-primary hover:bg-primary/90'
                      : 'hover:bg-card'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-border/30" />

        {/* Secondary Menu */}
        <div className="space-y-1">
          {secondaryMenuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start gap-3 ${
                    isActive
                      ? 'bg-primary hover:bg-primary/90'
                      : 'hover:bg-card'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/30 space-y-2">
        <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-card text-destructive hover:text-destructive">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

// Named export for use with named imports
export { DashboardSidebarComponent as DashboardSidebar };

// Default export for use with default imports
export default DashboardSidebarComponent;
