'use client';

import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { DashboardContent } from '@/components/dashboard-content';
import { UserProfileCard } from '@/components/user-profile-card';
import { useUserProfile } from '@/lib/hooks/use-user-profile';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { profile, loading, error } = useUserProfile();

  return (
    <div className="flex h-screen bg-background text-foreground">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8 space-y-6">
          {/* User Profile Section */}
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Profile</AlertTitle>
              <AlertDescription>
                {error}. Please try refreshing the page or contact support if the issue persists.
              </AlertDescription>
            </Alert>
          ) : profile ? (
            <UserProfileCard profile={profile} />
          ) : null}

          {/* Dashboard Content */}
          <DashboardContent />
        </div>
      </main>
    </div>
  );
}
