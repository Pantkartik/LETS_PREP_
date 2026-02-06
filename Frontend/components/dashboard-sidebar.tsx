'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/components/supabase-auth-provider';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
  GraduationCap,
  Menu,
  ShieldAlert,
  Database,
  Lock,
  XCircle,
  Power,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function LogoutOverlay({ onComplete }: { onComplete: () => void }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messages = [
      { text: "Initiating teardown sequence...", delay: 50 },
      { text: "Invalidating session tokens...", delay: 400 },
      { text: "Clearing secure cache storage...", delay: 800 },
      { text: "Disconnecting from neural mesh...", delay: 1200 },
      { text: "System safe for disconnect.", delay: 1700 },
      { text: "Goodbye, user.", delay: 1950 },
    ];

    const timeouts = messages.map(({ text, delay }) =>
      setTimeout(() => setLogs(prev => [...prev.slice(-3), `> ${text}`]), delay)
    );

    const progressInterval = setInterval(() => {
      setProgress(p => (p >= 100 ? 100 : p + 1));
    }, 20);

    const finalTimeout = setTimeout(onComplete, 2200);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(progressInterval);
      clearTimeout(finalTimeout);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[9999] flex flex-col items-center justify-center font-mono"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,255,100,0.05)_50%,transparent_100%)] bg-[length:100%_4px] animate-scanline" />
      </div>

      <div className="relative mb-12">
        <motion.div
          animate={{
            rotate: [0, 90, 180, 270, 360],
            scale: [1, 1.1, 1],
            borderColor: ['#3b82f6', '#ef4444', '#3b82f6']
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 rounded-full border-t-2 border-b-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Power className="w-12 h-12 text-red-500 animate-pulse" />
        </div>
      </div>

      <div className="w-full max-w-sm px-6 space-y-6">
        <div className="flex justify-between text-[10px] text-red-400 font-bold tracking-widest uppercase">
          <span>Session Termination</span>
          <span>{Math.round(progress)}%</span>
        </div>

        <div className="h-1 bg-gray-900 rounded-full overflow-hidden border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-red-600 to-orange-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="bg-black/40 border border-white/5 rounded-lg p-4 h-32 overflow-hidden">
          <div className="text-[11px] space-y-1.5">
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className={i === logs.length - 1 ? "text-red-400" : "text-gray-500"}
              >
                {log}
              </motion.div>
            ))}
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-2 h-4 bg-red-500/50 align-middle ml-1"
            />
          </div>
        </div>
      </div>

      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-12 text-[10px] text-gray-600 tracking-[0.2em] uppercase"
      >
        Secure Logout Protocol Active
      </motion.div>
    </motion.div>
  );
}

interface SidebarContentProps {
  navItems: any[];
  pathname: string;
  handleLogout: () => void;
  onLinkClick?: () => void;
}

const SidebarContent = ({ navItems, pathname, handleLogout, onLinkClick }: SidebarContentProps) => (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <Link href="/" className="flex items-center gap-2 p-6 border-b border-border/30" onClick={onLinkClick}>
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
            <Link key={item.href} href={item.href} onClick={onLinkClick}>
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
  </div>
);

const DashboardSidebarComponent = () => {
  const pathname = usePathname();

  const { signOut, profile, user } = useSupabaseAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
  };

  const completeSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
      setIsLoggingOut(false);
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
    { label: 'My Classrooms', icon: GraduationCap, href: '/my-classrooms' },
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

  if (!isMounted) {
    return (
      <aside className="w-64 border-r border-border/30 bg-card/50 h-screen sticky top-0 hidden md:flex flex-col">
        {/* Placeholder for SSR */}
      </aside>
    )
  }

  return (
    <>
      <AnimatePresence>
        {isLoggingOut && <LogoutOverlay onComplete={completeSignOut} />}
      </AnimatePresence>

      {/* Mobile Trigger */}
      <div className="md:hidden fixed top-3 left-3 z-40">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-background/80 backdrop-blur-md shadow-md">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-card/95 backdrop-blur-xl border-r border-border/50">
            <SidebarContent
              navItems={navItems}
              pathname={pathname}
              handleLogout={handleLogout}
              onLinkClick={() => setIsOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border/30 bg-card/50 h-screen sticky top-0 flex-col">
        <SidebarContent
          navItems={navItems}
          pathname={pathname}
          handleLogout={handleLogout}
        />
      </aside>
    </>
  );
};

export const DashboardSidebar = DashboardSidebarComponent;
