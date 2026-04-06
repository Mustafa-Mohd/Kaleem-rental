import { Building2, LayoutDashboard, CreditCard, FileText, User, LogOut, Search, Bell } from 'lucide-react';
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
  { title: 'Dashboard', url: '/tenant', icon: LayoutDashboard },
  { title: 'Browse Properties', url: '/tenant/browse', icon: Search },
  { title: 'My Payments', url: '/tenant/payments', icon: CreditCard },
  { title: 'Lease Details', url: '/tenant/lease', icon: FileText },
  { title: 'Notifications', url: '/tenant/notifications', icon: Bell },
  { title: 'My Profile', url: '/tenant/profile', icon: User },
];

export function TenantSidebar() {
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
            <div className="h-8 w-8 rounded-lg bg-success/20 flex items-center justify-center shrink-0">
              <Building2 className="h-4 w-4 text-success" />
            </div>
            {!collapsed && (
              <div>
                <span className="text-lg font-bold text-sidebar-foreground">RentFlow</span>
                <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-success/20 text-success font-medium">Tenant</span>
              </div>
            )}
          </div>
          <SidebarGroupLabel className="text-sidebar-foreground/50">My Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/tenant'}
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
