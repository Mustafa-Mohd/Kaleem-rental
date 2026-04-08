import { Shield, Bell, Palette, Database, Users, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { demoStats } from '@/hooks/useDemoData';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
        <p className="text-muted-foreground mt-1">System configuration and admin preferences.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Account Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Admin Account</CardTitle>
              <CardDescription>Your admin profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full gradient-bg flex items-center justify-center text-xl font-bold text-primary-foreground">A</div>
                <div>
                  <p className="font-semibold text-foreground text-lg">Admin User</p>
                  <p className="text-sm text-muted-foreground">admin@rentflow.com</p>
                  <Badge className="mt-1">Super Admin</Badge>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span className="text-foreground font-medium">Super Admin</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Account Created</span><span className="text-foreground">Jun 15, 2025</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Last Login</span><span className="text-foreground">Today, 10:30 AM</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Two-Factor Auth</span><Badge variant="secondary">Enabled</Badge></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Database className="h-5 w-5 text-primary" /> System Overview</CardTitle>
              <CardDescription>Database and system status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Total Buildings', value: demoStats.totalBuildings, icon: Building2 },
                { label: 'Total Flats', value: demoStats.totalFlats, icon: Building2 },
                { label: 'Total Tenants', value: demoStats.totalTenants, icon: Users },
                { label: 'Occupancy Rate', value: `${demoStats.occupancyRate}%`, icon: Building2 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                <span className="text-sm text-success font-medium">System Status</span>
                <Badge className="bg-success text-success-foreground">All Systems Operational</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5 text-warning" /> Notifications</CardTitle>
              <CardDescription>Configure alert preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Late payment alerts', desc: 'Get notified when rent is overdue', checked: true },
                { label: 'New tenant onboarding', desc: 'Notification for new tenant registrations', checked: true },
                { label: 'Lease expiry reminders', desc: '30-day advance lease expiration alerts', checked: true },
                { label: 'Maintenance requests', desc: 'Tenant maintenance ticket notifications', checked: false },
                { label: 'Monthly summary reports', desc: 'Automated monthly financial summary', checked: true },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{n.label}</p>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={n.checked} />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Preferences</CardTitle>
              <CardDescription>Display and interface settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Compact sidebar', desc: 'Use icon-only sidebar by default', checked: false },
                { label: 'Show animations', desc: 'Enable page transition animations', checked: true },
                { label: 'Currency format', desc: 'Display amounts in Indian Rupee (₹)', checked: true },
                { label: 'Auto-refresh data', desc: 'Real-time data updates every 30 seconds', checked: true },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{n.label}</p>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={n.checked} />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
