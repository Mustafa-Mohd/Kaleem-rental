import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TenantSidebar } from '@/components/TenantSidebar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { User } from 'lucide-react';

export default function TenantLayout() {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <TenantSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <User className="h-3 w-3" /> Tenant
              </Badge>
              <span className="text-sm text-muted-foreground">{user?.email || 'tenant@email.com'}</span>
              <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center text-xs font-medium text-success">
                {user?.email?.[0]?.toUpperCase() || 'T'}
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto bg-muted/20">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
