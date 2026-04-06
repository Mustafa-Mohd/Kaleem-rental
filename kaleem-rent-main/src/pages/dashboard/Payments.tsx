import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Search, TrendingUp, Clock, AlertCircle, Edit2, Check, X, Plus, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function Payments() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editPayment, setEditPayment] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newMethod, setNewMethod] = useState('');
  const [newDate, setNewDate] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addTenantId, setAddTenantId] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [addMethod, setAddMethod] = useState('cash');
  const [addStatus, setAddStatus] = useState('pending');
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rent_payments')
        .select('*, tenants(full_name, user_id), flats:flat_id(flat_number)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants-for-payments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tenants').select('id, full_name, flat_id, rent_amount, user_id, flats(flat_number)');
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('rent_payments').update({
        payment_status: newStatus,
        payment_method: newMethod,
        payment_date: newDate || editPayment.payment_date,
      }).eq('id', editPayment.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      toast({ title: 'Payment updated' });
      setEditPayment(null);
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const quickStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('rent_payments').update({ payment_status: status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      toast({ title: `Status → ${status}` });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const addPaymentMutation = useMutation({
    mutationFn: async () => {
      const tenant = tenants.find(t => t.id === addTenantId);
      if (!tenant) throw new Error('Select a tenant');
      const { error } = await supabase.from('rent_payments').insert({
        tenant_id: addTenantId,
        user_id: user!.id,
        flat_id: tenant.flat_id,
        payment_amount: parseFloat(addAmount) || tenant.rent_amount,
        payment_method: addMethod,
        payment_status: addStatus,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      toast({ title: 'Payment record created' });
      setShowAdd(false); setAddTenantId(''); setAddAmount(''); setAddMethod('cash'); setAddStatus('pending');
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (payment: any) => {
      const tenant = payment.tenants as any;
      if (!tenant?.user_id) throw new Error('No tenant linked');
      const { error } = await supabase.from('notifications').insert({
        sender_id: user!.id,
        recipient_id: tenant.user_id,
        title: 'Rent Payment Reminder 💰',
        message: `Your rent payment of ₹${Number(payment.payment_amount).toLocaleString()} is ${payment.payment_status}. Please make the payment at the earliest.`,
        type: 'rent_reminder',
      });
      if (error) throw error;
    },
    onSuccess: () => toast({ title: 'Reminder sent to tenant' }),
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const filtered = payments.filter(p => {
    const name = (p.tenants as any)?.full_name?.toLowerCase() || '';
    const flat = (p.flats as any)?.flat_number?.toLowerCase() || '';
    const matchSearch = name.includes(search.toLowerCase()) || flat.includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.payment_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPaid = payments.filter(p => p.payment_status === 'paid').reduce((s, p) => s + Number(p.payment_amount), 0);
  const totalPending = payments.filter(p => p.payment_status === 'pending').reduce((s, p) => s + Number(p.payment_amount), 0);
  const totalLate = payments.filter(p => p.payment_status === 'late').reduce((s, p) => s + Number(p.payment_amount), 0);

  const statusColor = (s: string) => s === 'paid' ? 'default' as const : s === 'pending' ? 'secondary' as const : 'destructive' as const;
  const formatDate = (d: string | null) => {
    if (!d) return '—';
    try { return format(new Date(d), 'MMM dd, yyyy'); } catch { return d || '—'; }
  };

  const openEdit = (p: any) => {
    setEditPayment(p);
    setNewStatus(p.payment_status);
    setNewMethod(p.payment_method);
    setNewDate(p.payment_date || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rent Payments</h1>
          <p className="text-muted-foreground mt-1">{payments.length} records from database</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Payment
        </Button>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Collected', value: totalPaid, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Pending', value: totalPending, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Late / Overdue', value: totalLate, icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-border/50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl ${c.bg} flex items-center justify-center`}>
                  <c.icon className={`h-6 w-6 ${c.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">₹{c.value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tenant or flat..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {['all', 'paid', 'pending', 'late'].map(s => (
            <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(s)} className="capitalize">
              {s} {s !== 'all' && <span className="ml-1 text-xs opacity-70">({payments.filter(p => p.payment_status === s).length})</span>}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Flat</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No payments found</TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {((p.tenants as any)?.full_name || '?').split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{(p.tenants as any)?.full_name || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{(p.flats as any)?.flat_number || '—'}</TableCell>
                  <TableCell className="font-medium text-foreground">₹{Number(p.payment_amount).toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(p.payment_date)}</TableCell>
                  <TableCell className="text-muted-foreground capitalize">{p.payment_method.replace('_', ' ')}</TableCell>
                  <TableCell><Badge variant={statusColor(p.payment_status)}>{p.payment_status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {p.payment_status !== 'paid' && (
                        <>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-success hover:text-success hover:bg-success/10" onClick={() => quickStatusMutation.mutate({ id: p.id, status: 'paid' })} title="Mark Paid">
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-warning hover:text-warning hover:bg-warning/10" onClick={() => sendReminderMutation.mutate(p)} title="Send Reminder">
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                      {p.payment_status === 'pending' && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => quickStatusMutation.mutate({ id: p.id, status: 'late' })} title="Mark Late">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)} title="Edit">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editPayment} onOpenChange={() => setEditPayment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
            <DialogDescription>Update payment for {(editPayment?.tenants as any)?.full_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input value={`₹${Number(editPayment?.payment_amount || 0).toLocaleString()}`} disabled className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">✅ Paid</SelectItem>
                  <SelectItem value="pending">⏳ Pending</SelectItem>
                  <SelectItem value="late">❌ Late</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={newMethod} onValueChange={setNewMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPayment(null)}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Payment Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Record</DialogTitle>
            <DialogDescription>Create a new rent payment entry</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tenant *</Label>
              <Select value={addTenantId} onValueChange={(v) => {
                setAddTenantId(v);
                const t = tenants.find(t => t.id === v);
                if (t) setAddAmount(String(t.rent_amount));
              }}>
                <SelectTrigger><SelectValue placeholder="Select tenant" /></SelectTrigger>
                <SelectContent>
                  {tenants.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.full_name} — {(t.flats as any)?.flat_number || 'No flat'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input type="number" value={addAmount} onChange={e => setAddAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={addMethod} onValueChange={setAddMethod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={addStatus} onValueChange={setAddStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={() => addPaymentMutation.mutate()} disabled={!addTenantId || addPaymentMutation.isPending}>
              {addPaymentMutation.isPending ? 'Creating...' : 'Create Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
