import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function TenantPayments() {
  const { user } = useAuth();

  const { data: tenant } = useQuery({
    queryKey: ['my-tenant-record', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('tenants').select('id').eq('user_id', user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['my-payments', tenant?.id],
    queryFn: async () => {
      if (!tenant) return [];
      const { data, error } = await supabase
        .from('rent_payments')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenant,
  });

  const totalPaid = payments.filter(p => p.payment_status === 'paid' || p.payment_status === 'late').reduce((s, p) => s + Number(p.payment_amount), 0);
  const pendingAmount = payments.filter(p => p.payment_status === 'pending').reduce((s, p) => s + Number(p.payment_amount), 0);

  if (!tenant) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">My Payments</h1>
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <CreditCard className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No tenant record</h3>
            <p className="text-muted-foreground">Browse properties and send a request to get started.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Payments</h1>
        <p className="text-muted-foreground mt-1">View your rent payment history</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Paid', value: `₹${totalPaid.toLocaleString()}`, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Pending', value: `₹${pendingAmount.toLocaleString()}`, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Total Records', value: payments.length, icon: CreditCard, color: 'text-primary', bg: 'bg-primary/10' },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-border/50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-lg ${c.bg} flex items-center justify-center`}>
                  <c.icon className={`h-6 w-6 ${c.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{c.value}</p>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Payment History</CardTitle>
            <CardDescription>All rent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No payments recorded yet</p>
            ) : (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        p.payment_status === 'paid' ? 'bg-success/10' : p.payment_status === 'pending' ? 'bg-warning/10' : 'bg-destructive/10'
                      }`}>
                        {p.payment_status === 'paid' ? <CheckCircle2 className="h-5 w-5 text-success" /> :
                         p.payment_status === 'pending' ? <Clock className="h-5 w-5 text-warning" /> :
                         <AlertCircle className="h-5 w-5 text-destructive" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{format(new Date(p.payment_date), 'MMMM yyyy')}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(p.payment_date), 'MMM dd, yyyy')} • {p.payment_method?.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">₹{Number(p.payment_amount).toLocaleString()}</p>
                      <Badge variant={p.payment_status === 'paid' ? 'default' : p.payment_status === 'pending' ? 'secondary' : 'destructive'} className="text-[10px]">
                        {p.payment_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
