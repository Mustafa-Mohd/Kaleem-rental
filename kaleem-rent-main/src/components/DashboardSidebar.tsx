import { Building2, LayoutDashboard, Home, Users, CreditCard, BarChart3, Settings, Activity, LogOut, Inbox, Bell } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Overview', url: '/admin', icon: LayoutDashboard },
  { title: 'Buildings', url: '/admin/buildings', icon: Building2 },
  { title: 'Flats', url: '/admin/flats', icon: Home },
  { title: 'Tenants', url: '/admin/tenants', icon: Users },
  { title: 'Rent Payments', url: '/admin/payments', icon: CreditCard },
  { title: 'Requests', url: '/admin/requests', icon: Inbox },
  { title: 'Notifications', url: '/admin/notifications', icon: Bell },
  { title: 'Reports', url: '/admin/reports', icon: BarChart3 },
  { title: 'Activity Logs', url: '/admin/activity', icon: Activity },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <div className="flex items-center gap-2 px-4 py-4">
            <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center shrink-0">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <span className="text-lg font-bold text-sidebar-foreground">RentFlow</span>
                <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">Admin</span>
              </div>
            )}
          </div>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/admin'}
                      className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-sidebar border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="mr-2 h-4 w-4 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
