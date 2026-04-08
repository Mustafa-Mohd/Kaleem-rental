import { motion } from 'framer-motion';
import { Home, CreditCard, CalendarDays, CheckCircle2, Clock, AlertCircle, Sparkles, Building2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function TenantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.email?.split('@')[0] || 'Tenant';

  // Get tenant record for this user
  const { data: tenant } = useQuery({
    queryKey: ['my-tenant-record', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*, flats(flat_number, floor, rent_amount, buildings(name, address))')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Get payments for this tenant
  const { data: payments = [] } = useQuery({
    queryKey: ['my-payments', tenant?.id],
    queryFn: async () => {
      if (!tenant) return [];
      const { data, error } = await supabase
        .from('rent_payments')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenant,
  });

  // Get notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['my-notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // If no tenant record, show browse prompt
  if (tenant === null) {
    return (
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50 bg-gradient-to-r from-primary/5 via-background to-accent/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
            <CardContent className="p-8 relative text-center">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Welcome, {displayName}! 👋</h1>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You're not assigned to any flat yet. Browse available properties and send a request to become a tenant.
              </p>
              <Button size="lg" className="gap-2" onClick={() => navigate('/tenant/browse')}>
                <Search className="h-4 w-4" /> Browse Available Properties
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Show notifications if any */}
        {notifications.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">Recent Notifications</h2>
            <div className="space-y-2">
              {notifications.map(n => (
                <Card key={n.id} className={`border-border/50 ${!n.is_read ? 'border-l-4 border-l-primary' : ''}`}>
                  <CardContent className="p-4">
                    <p className="font-medium text-foreground">{n.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{format(new Date(n.created_at), 'MMM dd, h:mm a')}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Has tenant record - show full dashboard
  const flat = tenant?.flats as any;
  const building = flat?.buildings;
  const paidCount = payments.filter(p => p.payment_status === 'paid').length;
  const pendingPayment = payments.find(p => p.payment_status === 'pending');
  const latePayment = payments.find(p => p.payment_status === 'late');

  const leaseProgress = () => {
    if (!tenant?.lease_start || !tenant?.lease_end) return 0;
    const start = new Date(tenant.lease_start).getTime();
    const end = new Date(tenant.lease_end).getTime();
    const now = Date.now();
    return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
  };

  const daysRemaining = tenant?.lease_end ? Math.max(0, differenceInDays(new Date(tenant.lease_end), new Date())) : null;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border/50 bg-gradient-to-r from-primary/5 via-background to-success/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          <CardContent className="p-6 relative">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Welcome back, {displayName}! 👋</h1>
            </div>
            <p className="text-muted-foreground">
              {building?.name} • Flat {flat?.flat_number} • Floor {flat?.floor}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Your Flat', value: flat?.flat_number || '—', sub: building?.name, icon: Home, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Monthly Rent', value: `₹${Number(tenant?.rent_amount || 0).toLocaleString()}`, sub: 'Due on 1st', icon: CreditCard, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Payments Made', value: `${paidCount}/${payments.length}`, sub: 'This lease', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Status', value: latePayment ? 'Late' : pendingPayment ? 'Pending' : 'All Paid!', sub: pendingPayment ? `₹${Number(pendingPayment.payment_amount).toLocaleString()}` : '', icon: latePayment ? AlertCircle : pendingPayment ? Clock : CheckCircle2, color: latePayment ? 'text-destructive' : pendingPayment ? 'text-warning' : 'text-success', bg: latePayment ? 'bg-destructive/10' : pendingPayment ? 'bg-warning/10' : 'bg-success/10' },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-border/50 h-full hover-lift">
              <CardContent className="p-5">
                <div className={`h-10 w-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                  <c.icon className={`h-5 w-5 ${c.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{c.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{c.label}</p>
                {c.sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{c.sub}</p>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lease Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Lease Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Building', value: building?.name || '—' },
                { label: 'Address', value: building?.address || '—' },
                { label: 'Flat', value: `${flat?.flat_number || '—'} (Floor ${flat?.floor || 0})` },
                { label: 'Lease Start', value: tenant?.lease_start ? format(new Date(tenant.lease_start), 'MMM dd, yyyy') : '—' },
                { label: 'Lease End', value: tenant?.lease_end ? format(new Date(tenant.lease_end), 'MMM dd, yyyy') : '—' },
                { label: 'Monthly Rent', value: `₹${Number(tenant?.rent_amount || 0).toLocaleString()}` },
              ].map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-foreground font-medium">{item.value}</span>
                </div>
              ))}
              {tenant?.lease_start && tenant?.lease_end && (
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Lease Progress</span>
                    <span>{daysRemaining} days left</span>
                  </div>
                  <Progress value={leaseProgress()} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Payment History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No payments recorded yet</p>
              ) : payments.slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      p.payment_status === 'paid' ? 'bg-success/10' : p.payment_status === 'pending' ? 'bg-warning/10' : 'bg-destructive/10'
                    }`}>
                      {p.payment_status === 'paid' ? <CheckCircle2 className="h-4 w-4 text-success" /> :
                       p.payment_status === 'pending' ? <Clock className="h-4 w-4 text-warning" /> :
                       <AlertCircle className="h-4 w-4 text-destructive" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{format(new Date(p.payment_date), 'MMM yyyy')}</p>
                      <p className="text-xs text-muted-foreground">{p.payment_method?.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">₹{Number(p.payment_amount).toLocaleString()}</p>
                    <Badge variant={p.payment_status === 'paid' ? 'default' : p.payment_status === 'pending' ? 'secondary' : 'destructive'} className="text-[10px]">
                      {p.payment_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-warning" /> Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No notifications yet</p>
              ) : notifications.map((n) => (
                <div key={n.id} className={`p-3 rounded-lg border transition-colors space-y-1 ${!n.is_read ? 'border-primary/30 bg-primary/[0.02]' : 'border-border/50'}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <span className="text-xs text-muted-foreground">{format(new Date(n.created_at), 'MMM dd')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
