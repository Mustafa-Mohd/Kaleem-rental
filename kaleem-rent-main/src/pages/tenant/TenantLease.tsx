import { motion } from 'framer-motion';
import { FileText, Home, IndianRupee, Clock, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format, differenceInDays } from 'date-fns';

export default function TenantLease() {
  const { user } = useAuth();

  const { data: tenant } = useQuery({
    queryKey: ['my-tenant-record', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*, flats(flat_number, floor, rent_amount, buildings(name, address, city))')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!tenant) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Lease Agreement</h1>
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No active lease</h3>
            <p className="text-muted-foreground">Browse properties and send a request to get started.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const flat = tenant.flats as any;
  const building = flat?.buildings;

  const daysRemaining = tenant.lease_end ? Math.max(0, differenceInDays(new Date(tenant.lease_end), new Date())) : null;
  const totalDays = tenant.lease_start && tenant.lease_end
    ? differenceInDays(new Date(tenant.lease_end), new Date(tenant.lease_start))
    : null;
  const progress = totalDays && daysRemaining !== null
    ? Math.round(((totalDays - daysRemaining) / totalDays) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lease Agreement</h1>
        <p className="text-muted-foreground mt-1">Your current lease details</p>
      </div>

      {/* Status Bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Active Lease</h2>
                  <p className="text-sm text-muted-foreground">
                    {tenant.lease_start ? format(new Date(tenant.lease_start), 'MMM dd, yyyy') : '—'} — {tenant.lease_end ? format(new Date(tenant.lease_end), 'MMM dd, yyyy') : '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-success text-success-foreground">Active</Badge>
                {daysRemaining !== null && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {daysRemaining} days left
                  </Badge>
                )}
              </div>
            </div>
            {totalDays && (
              <>
                <Progress value={progress} className="h-2.5" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                  <span>{progress}% completed</span>
                  <span>{daysRemaining} days left</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Property Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Home className="h-5 w-5 text-primary" /> Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Building', value: building?.name || '—' },
                { label: 'Address', value: building?.address || '—' },
                { label: 'City', value: building?.city || '—' },
                { label: 'Flat Number', value: flat?.flat_number || '—' },
                { label: 'Floor', value: String(flat?.floor ?? '—') },
              ].map((item, i) => (
                <div key={i} className="flex justify-between text-sm p-2 rounded hover:bg-muted/50">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-foreground font-medium">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Financial Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><IndianRupee className="h-5 w-5 text-success" /> Financial Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Monthly Rent', value: `₹${Number(tenant.rent_amount || 0).toLocaleString()}`, highlight: true },
                { label: 'Flat Base Rent', value: `₹${Number(flat?.rent_amount || 0).toLocaleString()}` },
                { label: 'Lease Start', value: tenant.lease_start ? format(new Date(tenant.lease_start), 'MMM dd, yyyy') : '—' },
                { label: 'Lease End', value: tenant.lease_end ? format(new Date(tenant.lease_end), 'MMM dd, yyyy') : '—' },
              ].map((item, i) => (
                <div key={i} className={`flex justify-between text-sm p-3 rounded-lg ${(item as any).highlight ? 'bg-primary/5 border border-primary/10' : 'hover:bg-muted/50'}`}>
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={`font-semibold ${(item as any).highlight ? 'text-primary' : 'text-foreground'}`}>{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
