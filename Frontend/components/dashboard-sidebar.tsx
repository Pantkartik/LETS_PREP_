'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/components/supabase-auth-provider';
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
  LayoutDashboard,
  Swords,
  Bot,
  Award,
  Book,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const DashboardSidebarComponent = () => {
  const pathname = usePathname();

  const { signOut, profile, user } = useSupabaseAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const role = profile?.role || user?.user_metadata?.role || 'STUDENT';

  // Determine nav items based on role
  const navItems = role === 'TEACHER' ? [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/teacher-dashboard' },
    { label: 'Classes', icon: Users, href: '/classes' },
    { label: 'Competitions', icon: Trophy, href: '/teacher-competitions' },
    { label: 'Assignments', icon: Code, href: '/assignments' },
    { label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ] : [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Battle Arena', icon: Swords, href: '/battles' },
    { label: 'Problem Bank', icon: Code, href: '/problems' },
    { label: 'Interview Simulator', icon: Bot, href: '/interviews' },
    { label: 'Competitions', icon: Trophy, href: '/competitions' },
    { label: 'Leaderboards', icon: Award, href: '/leaderboards' },
    { label: 'Analytics', icon: BarChart3, href: '/analytics' },
    { label: 'Community', icon: Users, href: '/community' },
    { label: 'Resources', icon: BookOpen, href: '/resources' },
    { label: 'Profile', icon: User, href: '/profile' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ];

  // Prevent hydration mismatch by initially rendering a consistent state (or nothing) if needed
  // However, for sidebar, we usually want SEO / quick visual. 
  // Code staleness was likely the issue, but 'isMounted' ensures we can handle client-only logic safely if needed in future.
  // For now, simply re-saving this file with the 'isMounted' hook (even unused effectively) will trigger a rebuild.

  return (
    <aside className="w-64 border-r border-border/30 bg-card/50 h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 p-6 border-b border-border/30">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <Code className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-lg">LET'S PREP</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Main Menu */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className={`w-full justify-start gap-3 ${isActive
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
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-400 hover:text-red-500 hover:bg-red-500/10"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </Button>
      </div>
    </aside>
  );
};

export const DashboardSidebar = DashboardSidebarComponent;
