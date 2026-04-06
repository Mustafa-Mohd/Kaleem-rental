import { useState } from 'react';
import { motion } from 'framer-motion';
import { Inbox, CheckCircle2, XCircle, Clock, Home, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function Requests() {
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseEnd, setLeaseEnd] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['tenant-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_requests')
        .select('*, flats(flat_number, rent_amount, building_id, buildings(name))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      const req = selectedReq;
      const flat = req.flats as any;

      // 1. Update request status
      const { error: reqError } = await supabase
        .from('tenant_requests')
        .update({ status: 'approved', admin_notes: adminNotes })
        .eq('id', req.id);
      if (reqError) throw reqError;

      // 2. Create tenant record linked to the user who requested
      const { error: tenantError } = await supabase.from('tenants').insert({
        user_id: req.user_id,
        full_name: req.full_name,
        email: req.email,
        phone: req.phone,
        flat_id: req.flat_id,
        rent_amount: flat?.rent_amount || 0,
        lease_start: leaseStart || null,
        lease_end: leaseEnd || null,
      });
      if (tenantError) throw tenantError;

      // 3. Mark flat as occupied
      const { error: flatError } = await supabase
        .from('flats')
        .update({ occupancy_status: 'occupied' })
        .eq('id', req.flat_id);
      if (flatError) throw flatError;

      // 4. Send notification to the tenant
      await supabase.from('notifications').insert({
        sender_id: user!.id,
        recipient_id: req.user_id,
        title: 'Request Approved! 🎉',
        message: `Your request for flat ${flat?.flat_number} in ${flat?.buildings?.name} has been approved. Welcome aboard!`,
        type: 'announcement',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-requests'] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['flats'] });
      toast({ title: 'Request approved', description: 'Tenant has been registered and flat marked as occupied.' });
      setSelectedReq(null); setAdminNotes(''); setLeaseStart(''); setLeaseEnd('');
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const req = requests.find(r => r.id === id);
      const { error } = await supabase
        .from('tenant_requests')
        .update({ status: 'rejected', admin_notes: adminNotes || 'Request rejected by admin.' })
        .eq('id', id);
      if (error) throw error;

      // Notify the user
      if (req) {
        await supabase.from('notifications').insert({
          sender_id: user!.id,
          recipient_id: req.user_id,
          title: 'Request Rejected',
          message: `Your request for flat ${(req.flats as any)?.flat_number} has been rejected. ${adminNotes || ''}`,
          type: 'warning',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-requests'] });
      toast({ title: 'Request rejected' });
      setAdminNotes('');
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const pending = requests.filter(r => r.status === 'pending');
  const resolved = requests.filter(r => r.status !== 'pending');

  const statusBadge = (s: string) => {
    if (s === 'approved') return <Badge className="bg-success text-success-foreground">Approved</Badge>;
    if (s === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tenant Requests</h1>
        <p className="text-muted-foreground mt-1">{pending.length} pending • {resolved.length} resolved</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-warning" /> Pending Requests
        </h2>
        {pending.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-8 text-center">
              <Inbox className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No pending requests</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {pending.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover-lift border-border/50 border-l-4 border-l-warning">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-warning/10 text-warning font-semibold text-sm">
                          {r.full_name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{r.full_name}</p>
                        <p className="text-xs text-muted-foreground">{r.email} • {r.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Home className="h-3.5 w-3.5" />
                      <span>{(r.flats as any)?.flat_number} — {(r.flats as any)?.buildings?.name}</span>
                    </div>
                    {r.message && (
                      <div className="flex items-start gap-2 text-sm">
                        <MessageSquare className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                        <p className="text-muted-foreground italic">"{r.message}"</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">{format(new Date(r.created_at), 'MMM dd, yyyy h:mm a')}</p>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" className="flex-1 gap-1 bg-success hover:bg-success/90 text-success-foreground" onClick={() => { setSelectedReq(r); setAdminNotes(''); }}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1 gap-1" onClick={() => rejectMutation.mutate(r.id)}>
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {resolved.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Previous Requests</h2>
          <div className="space-y-2">
            {resolved.map(r => (
              <div key={r.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    {r.full_name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{r.full_name}</p>
                  <p className="text-xs text-muted-foreground">{(r.flats as any)?.flat_number} — {(r.flats as any)?.buildings?.name}</p>
                </div>
                {statusBadge(r.status)}
                <span className="text-xs text-muted-foreground">{format(new Date(r.created_at), 'MMM dd')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approve Dialog with lease details */}
      <Dialog open={!!selectedReq} onOpenChange={() => setSelectedReq(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Tenant Request</DialogTitle>
            <DialogDescription>
              Approve {selectedReq?.full_name}'s request for flat {(selectedReq?.flats as any)?.flat_number} at ₹{Number((selectedReq?.flats as any)?.rent_amount || 0).toLocaleString()}/mo.
              This will create a tenant record and mark the flat as occupied.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lease Start Date</Label>
                <Input type="date" value={leaseStart} onChange={e => setLeaseStart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Lease End Date</Label>
                <Input type="date" value={leaseEnd} onChange={e => setLeaseEnd(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Admin Notes (optional)</Label>
              <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Add any notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReq(null)}>Cancel</Button>
            <Button className="bg-success hover:bg-success/90 text-success-foreground" onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}>
              {approveMutation.isPending ? 'Approving...' : 'Confirm & Create Tenant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
