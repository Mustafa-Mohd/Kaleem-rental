import { motion } from 'framer-motion';
import { User, Mail, Phone, Shield, Building2, Home, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function TenantProfile() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: tenant } = useQuery({
    queryKey: ['my-tenant-record', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*, flats(flat_number, floor, buildings(name, address))')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const flat = tenant?.flats as any;
  const building = flat?.buildings;
  const displayName = profile?.full_name || tenant?.full_name || user?.email?.split('@')[0] || 'Tenant';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">Your account and rental information</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1">
          <Card className="border-border/50">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-4">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-foreground">{displayName}</h2>
              <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
              <Badge className="mt-3">Tenant</Badge>
              <Separator className="my-4" />
              <div className="w-full space-y-3 text-left">
                {tenant?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{tenant.phone}</span>
                  </div>
                )}
                {tenant?.id_proof && (
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{tenant.id_proof}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    Joined {profile?.created_at ? format(new Date(profile.created_at), 'MMM dd, yyyy') : '—'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <Card className="border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-lg">Account Details</CardTitle>
              <CardDescription>Information linked to your rental</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { icon: User, label: 'Full Name', value: displayName },
                { icon: Mail, label: 'Email', value: user?.email || '—' },
                { icon: Phone, label: 'Phone', value: tenant?.phone || profile?.phone || '—' },
                { icon: Building2, label: 'Building', value: building?.name || 'Not assigned' },
                { icon: Home, label: 'Flat', value: flat?.flat_number ? `${flat.flat_number} (Floor ${flat.floor})` : 'Not assigned' },
                { icon: Calendar, label: 'Lease Period', value: tenant?.lease_start && tenant?.lease_end ? `${format(new Date(tenant.lease_start), 'MMM dd, yyyy')} – ${format(new Date(tenant.lease_end), 'MMM dd, yyyy')}` : 'Not set' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
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
