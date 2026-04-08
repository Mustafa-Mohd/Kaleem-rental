import { motion } from 'framer-motion';
import { Building2, Home, Users, CreditCard, AlertCircle, TrendingUp, CalendarDays, ArrowUpRight, Activity, Clock, Bell, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function Overview() {
  const { data: buildings = [] } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('buildings').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: flats = [] } = useQuery({
    queryKey: ['flats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('flats').select('*, buildings(name)');
      if (error) throw error;
      return data;
    },
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tenants').select('*, flats(flat_number, buildings(name))').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('rent_payments').select('*, tenants(full_name), flats:flat_id(flat_number)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: recentLogs = [] } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(8);
      if (error) throw error;
      return data;
    },
  });

  const occupiedFlats = flats.filter(f => f.occupancy_status === 'occupied').length;
  const occupancyRate = flats.length > 0 ? Math.round((occupiedFlats / flats.length) * 100) : 0;
  const totalPaid = payments.filter(p => p.payment_status === 'paid').reduce((s, p) => s + Number(p.payment_amount), 0);
  const totalPending = payments.filter(p => p.payment_status === 'pending').reduce((s, p) => s + Number(p.payment_amount), 0);
  const latePayments = payments.filter(p => p.payment_status === 'late').length;

  const statCards = [
    { label: 'Buildings', value: buildings.length, icon: Building2, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Total Flats', value: flats.length, icon: Home, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Occupied', value: `${occupiedFlats}/${flats.length}`, icon: Users, color: 'text-success', bg: 'bg-success/10', sub: `${occupancyRate}% rate` },
    { label: 'Collected', value: `₹${totalPaid.toLocaleString()}`, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Pending', value: `₹${totalPending.toLocaleString()}`, icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Late', value: latePayments, icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  ];

  // Occupancy by building
  const buildingOccupancy = buildings.map(b => {
    const bFlats = flats.filter(f => f.building_id === b.id);
    const occ = bFlats.filter(f => f.occupancy_status === 'occupied').length;
    return { name: b.name, occupied: occ, vacant: bFlats.length - occ, total: bFlats.length };
  });

  const statusColor = (s: string) => s === 'paid' ? 'default' : s === 'pending' ? 'secondary' : 'destructive';
  const formatDate = (d: string | null) => {
    if (!d) return '—';
    try { return format(new Date(d), 'MMM dd, yyyy'); } catch { return '—'; }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time property management overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="hover-lift border-border/50 h-full">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-10 w-10 rounded-lg ${c.bg} flex items-center justify-center`}>
                    <c.icon className={`h-5 w-5 ${c.color}`} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/40" />
                </div>
                <p className="text-2xl font-bold text-foreground">{c.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{c.label}</p>
                {c.sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{c.sub}</p>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Occupancy by Building */}
      {buildingOccupancy.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Occupancy by Building</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {buildingOccupancy.map((b, i) => {
                  const rate = b.total > 0 ? Math.round((b.occupied / b.total) * 100) : 0;
                  return (
                    <div key={i} className="p-4 rounded-lg bg-muted/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{b.name}</span>
                        <Badge variant={rate >= 75 ? 'default' : rate >= 50 ? 'secondary' : 'destructive'} className="text-[10px]">{rate}%</Badge>
                      </div>
                      <Progress value={rate} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{b.occupied} occupied</span>
                        <span>{b.vacant} vacant</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Logs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Login & logout events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {recentLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
              ) : recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="mt-0.5">
                    {log.action === 'login' ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-warning" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{log.email}</p>
                    <p className="text-xs text-muted-foreground">{log.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {format(new Date(log.created_at), 'MMM dd, h:mm a')}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Tenants */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Tenants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {tenants.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No tenants yet</p>
              ) : tenants.slice(0, 5).map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {t.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.full_name}</p>
                    <p className="text-xs text-muted-foreground">{(t.flats as any)?.flat_number} • {(t.flats as any)?.buildings?.name || 'Unassigned'}</p>
                  </div>
                  <p className="text-sm font-medium text-foreground">₹{Number(t.rent_amount).toLocaleString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Payments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No payments yet</p>
              ) : payments.slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                    p.payment_status === 'paid' ? 'bg-success/10' : p.payment_status === 'pending' ? 'bg-warning/10' : 'bg-destructive/10'
                  }`}>
                    <CreditCard className={`h-4 w-4 ${
                      p.payment_status === 'paid' ? 'text-success' : p.payment_status === 'pending' ? 'text-warning' : 'text-destructive'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{(p.tenants as any)?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{(p.flats as any)?.flat_number || '—'} • {p.payment_method?.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-foreground">₹{Number(p.payment_amount).toLocaleString()}</p>
                    <Badge variant={statusColor(p.payment_status) as any} className="text-[10px]">{p.payment_status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
