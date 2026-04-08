import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, CalendarDays, Phone, Mail, CreditCard, IndianRupee, Eye, Plus, Trash2, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function Tenants() {
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idProof, setIdProof] = useState('');
  const [flatId, setFlatId] = useState('');
  const [rentAmount, setRentAmount] = useState('0');
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseEnd, setLeaseEnd] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tenants').select('*, flats(flat_number, buildings(name))').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: flats = [] } = useQuery({
    queryKey: ['flats-for-tenants'],
    queryFn: async () => {
      const { data, error } = await supabase.from('flats').select('id, flat_number, rent_amount, buildings(name)').eq('occupancy_status', 'vacant');
      if (error) throw error;
      return data;
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('rent_payments').select('*');
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('tenants').insert({
        full_name: fullName, email, phone, id_proof: idProof,
        flat_id: flatId || null,
        rent_amount: parseInt(rentAmount) || 0,
        lease_start: leaseStart || null,
        lease_end: leaseEnd || null,
        user_id: user!.id,
      });
      if (error) throw error;
      if (flatId) {
        await supabase.from('flats').update({ occupancy_status: 'occupied' }).eq('id', flatId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['flats'] });
      toast({ title: 'Tenant added', description: `${fullName} has been registered.` });
      setShowAdd(false);
      setFullName(''); setEmail(''); setPhone(''); setIdProof(''); setFlatId(''); setRentAmount('0'); setLeaseStart(''); setLeaseEnd('');
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const removeMutation = useMutation({
    mutationFn: async (tenant: any) => {
      // Free up the flat
      if (tenant.flat_id) {
        await supabase.from('flats').update({ occupancy_status: 'vacant' }).eq('id', tenant.flat_id);
      }
      // Delete tenant record
      const { error } = await supabase.from('tenants').delete().eq('id', tenant.id);
      if (error) throw error;

      // Notify the tenant user
      if (tenant.user_id) {
        await supabase.from('notifications').insert({
          sender_id: user!.id,
          recipient_id: tenant.user_id,
          title: 'Tenancy Ended',
          message: `Your tenancy for flat ${(tenant.flats as any)?.flat_number} has been ended by the admin.`,
          type: 'warning',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['flats'] });
      toast({ title: 'Tenant removed', description: 'Flat is now vacant.' });
      setSelectedTenant(null);
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const filtered = tenants.filter(t =>
    t.full_name.toLowerCase().includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  );

  const tenantPayments = selectedTenant
    ? payments.filter(p => p.tenant_id === selectedTenant.id)
    : [];

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    try { return format(new Date(d), 'MMM dd, yyyy'); } catch { return d || '—'; }
  };

  const statusColor = (s: string) => s === 'paid' ? 'default' as const : s === 'pending' ? 'secondary' as const : 'destructive' as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tenants</h1>
          <p className="text-muted-foreground mt-1">{tenants.length} active tenants</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Tenant
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover-lift border-border/50 h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {t.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{t.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{(t.flats as any)?.flat_number} • {(t.flats as any)?.buildings?.name}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedTenant(t)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => { if (confirm(`Remove ${t.full_name}?`)) removeMutation.mutate(t); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IndianRupee className="h-3.5 w-3.5" />
                      <span className="text-foreground font-medium">₹{Number(t.rent_amount).toLocaleString()}/mo</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>{formatDate(t.lease_start)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span className="truncate">{t.phone || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{t.email || '—'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Tenant Details Dialog */}
      <Dialog open={!!selectedTenant} onOpenChange={() => setSelectedTenant(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {selectedTenant?.full_name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p>{selectedTenant?.full_name}</p>
                <p className="text-sm font-normal text-muted-foreground">{(selectedTenant?.flats as any)?.flat_number} • {(selectedTenant?.flats as any)?.buildings?.name}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Phone</span><p className="font-medium text-foreground">{selectedTenant?.phone || '—'}</p></div>
              <div><span className="text-muted-foreground">Email</span><p className="font-medium text-foreground">{selectedTenant?.email || '—'}</p></div>
              <div><span className="text-muted-foreground">Lease Start</span><p className="font-medium text-foreground">{formatDate(selectedTenant?.lease_start || null)}</p></div>
              <div><span className="text-muted-foreground">Lease End</span><p className="font-medium text-foreground">{formatDate(selectedTenant?.lease_end || null)}</p></div>
              <div><span className="text-muted-foreground">Monthly Rent</span><p className="font-medium text-foreground">₹{Number(selectedTenant?.rent_amount || 0).toLocaleString()}</p></div>
              <div><span className="text-muted-foreground">ID Proof</span><p className="font-medium text-foreground">{selectedTenant?.id_proof || '—'}</p></div>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Payment History
              </h4>
              {tenantPayments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No payments recorded</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-auto">
                  {tenantPayments.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm font-medium text-foreground">₹{Number(p.payment_amount).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(p.payment_date)} • {p.payment_method.replace('_', ' ')}</p>
                      </div>
                      <Badge variant={statusColor(p.payment_status)}>{p.payment_status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="destructive" className="gap-2" onClick={() => { if (confirm(`Remove ${selectedTenant.full_name}?`)) removeMutation.mutate(selectedTenant); }}>
                <Trash2 className="h-4 w-4" /> Remove Tenant
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Tenant Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Tenant</DialogTitle>
            <DialogDescription>Register a new tenant and assign a flat.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Rahul Sharma" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assign Flat</Label>
              <Select value={flatId} onValueChange={(v) => {
                setFlatId(v);
                const f = flats.find(f => f.id === v);
                if (f) setRentAmount(String(f.rent_amount));
              }}>
                <SelectTrigger><SelectValue placeholder="Select vacant flat" /></SelectTrigger>
                <SelectContent>
                  {flats.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.flat_number} — {(f.buildings as any)?.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rent Amount (₹)</Label>
                <Input type="number" min="0" value={rentAmount} onChange={e => setRentAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>ID Proof</Label>
                <Input value={idProof} onChange={e => setIdProof(e.target.value)} placeholder="e.g. AADHAR-1234" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lease Start</Label>
                <Input type="date" value={leaseStart} onChange={e => setLeaseStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Lease End</Label>
                <Input type="date" value={leaseEnd} onChange={e => setLeaseEnd(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={() => addMutation.mutate()} disabled={!fullName || addMutation.isPending}>
              {addMutation.isPending ? 'Adding...' : 'Add Tenant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
