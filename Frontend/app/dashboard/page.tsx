import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { DashboardContent } from '@/components/dashboard-content';

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <DashboardContent />
        </div>
      </main>
    </div>
  );
}
