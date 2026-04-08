import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Pencil, Shuffle, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const MODES = ['Cash', 'SBI', 'HDFC', 'Bank Transfer', 'Online', 'Check'];

export default function ManagePayments() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
  const setLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState('');
  const [flatId, setFlatId] = useState('');
  const [amount, setAmount] = useState('0');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [status, setStatus] = useState('paid');
  const [mode, setMode] = useState('Cash');
  const [filterMode, setFilterMode] = useState<string | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);

  const randomizeAllMethods = async () => {
    setIsRandomizing(true);
    try {
      const localP = getLocal('local_payments');
      const localT = getLocal('local_tenants');
      const localF = getLocal('local_flats');

      if (localT.length === 0) {
        toast({ title: 'No tenants found!', description: 'Please sync ledger data first.', variant: 'destructive' });
        setIsRandomizing(false);
        return;
      }

      // Generate 20 random payments if none exist
      if (localP.length === 0) {
        const mockP = [];
        for (let i = 0; i < 24; i++) {
          const tenant = localT[Math.floor(Math.random() * localT.length)];
          const flat = localF.find((f: any) => f.id === tenant.flat_id);
          const method = MODES[Math.floor(Math.random() * MODES.length)];
          const dateStr = format(new Date(2026, 0 + Math.floor(i/6), 5 + (i%5)), 'yyyy-MM-dd');
          
          mockP.push({
            id: crypto.randomUUID(),
            tenant_id: tenant.id,
            flat_id: tenant.flat_id,
            payment_amount: tenant.rent_amount || 15000,
            payment_date: dateStr,
            payment_status: 'paid',
            payment_mode: method,
            payment_method: method.toLowerCase(),
            // Cache info for UI
            tenant_name: tenant.full_name,
            flat_no: flat?.flat_number || '?',
            building_name: getLocal('local_buildings').find((b: any) => b.id === flat?.building_id)?.name || '?'
          });
        }
        setLocal('local_payments', mockP);
      } else {
        // Just randomize existing methods
        const updated = localP.map((p: any) => {
          const randomMode = MODES[Math.floor(Math.random() * MODES.length)];
          return { ...p, payment_mode: randomMode, payment_method: randomMode.toLowerCase() };
        });
        setLocal('local_payments', updated);
      }

      qc.invalidateQueries();
      toast({ title: 'Payments Generated & Randomized!' });
    } catch (err) {
      toast({ title: 'Error', variant: 'destructive' });
    } finally {
      setIsRandomizing(false);
    }
  };

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => { 
      const local = getLocal('local_tenants');
      if (local.length > 0) return local;
      const { data } = await supabase.from('tenants').select('*, flats(flat_number, building_id, buildings(name))').order('full_name'); 
      return data || []; 
    },
  });

  const { data: allPayments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => { 
      const localP = getLocal('local_payments');
      if (localP.length > 0) {
        // Enrich local payments with building/flat info for the table
        const localT = getLocal('local_tenants');
        const localF = getLocal('local_flats');
        const localB = getLocal('local_buildings');
        
        return localP.map((p: any) => {
          const t = localT.find((tx: any) => tx.id === p.tenant_id);
          const f = localF.find((fx: any) => fx.id === p.flat_id);
          const b = localB.find((bx: any) => bx.id === f?.building_id);
          return {
            ...p,
            tenants: { 
              full_name: t?.full_name || p.tenant_name,
              phone: t?.phone
            },
            flats: { 
              flat_number: f?.flat_number || p.flat_no, 
              floor: f?.floor || p.floor,
              buildings: { name: b?.name || p.building_name } 
            }
          };
        }).sort((a: any, b: any) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
      }
      const { data } = await supabase.from('rent_payments').select('*, tenants(full_name), flats(flat_number, buildings(name))').order('payment_date', { ascending: false }); 
      return data || []; 
    },
  });

  const payments = filterMode 
    ? allPayments.filter((p: any) => (p.payment_mode || p.payment_method || '').toLowerCase() === filterMode.toLowerCase())
    : allPayments;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = { 
        id: editId || crypto.randomUUID(),
        tenant_id: tenantId, 
        flat_id: flatId || null, 
        payment_amount: Number(amount), 
        payment_date: date, 
        payment_status: status, 
        payment_mode: mode, 
        payment_method: mode.toLowerCase() 
      };

      const local = getLocal('local_payments');
      if (editId) {
        setLocal('local_payments', local.map((p: any) => p.id === editId ? payload : p));
      } else {
        setLocal('local_payments', [payload, ...local]);
      }
      
      // Try background
      supabase.from('rent_payments').upsert(payload).then();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payments'] }); toast({ title: editId ? 'Updated' : 'Added' }); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { 
      const local = getLocal('local_payments');
      setLocal('local_payments', local.filter((p: any) => p.id !== id));
      await supabase.from('rent_payments').delete().eq('id', id); 
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payments'] }); toast({ title: 'Deleted' }); },
  });

  const resetForm = () => { setOpen(false); setEditId(null); setTenantId(''); setFlatId(''); setAmount('0'); setDate(format(new Date(), 'yyyy-MM-dd')); setStatus('paid'); setMode('Cash'); };

  const selectTenant = (id: string) => {
    setTenantId(id);
    const t = tenants.find((x: any) => x.id === id);
    if (t) { setFlatId(t.flat_id || ''); setAmount(String(t.rent_amount)); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground">Payments Ledger</h1>
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-0.5">Financial Transaction Management</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-[10px] font-bold h-8 border-dashed"
            onClick={randomizeAllMethods}
            disabled={isRandomizing}
          >
            <Shuffle className={`h-3 w-3 mr-1.5 ${isRandomizing ? 'animate-spin' : ''}`} />
            {isRandomizing ? 'Processing...' : 'Randomize Data'}
          </Button>
          <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); else setOpen(true); }}>
            <DialogTrigger asChild><Button size="sm" className="text-[10px] font-bold h-8 px-4 uppercase tracking-wider"><Plus className="h-3.5 w-3.5 mr-1.5" />Record Payment</Button></DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-sm">{editId ? 'Edit' : 'Record'} Payment</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Tenant</p>
                <Select value={tenantId} onValueChange={selectTenant}>
                  <SelectTrigger className="text-sm"><SelectValue placeholder="Select Tenant" /></SelectTrigger>
                  <SelectContent className="max-h-60">{tenants.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Amount</p>
                  <Input type="number" placeholder="₹" value={amount} onChange={e => setAmount(e.target.value)} className="text-sm" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Date</p>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Status</p>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Method</p>
                  <Select value={mode} onValueChange={setMode}>
                    <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{MODES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            <Button size="sm" className="w-full text-xs font-bold mt-2" onClick={() => saveMutation.mutate()} disabled={!tenantId}>Save Payment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </div>

  {/* Payment mode summary */}
  <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Filter by Payment Method</p>
          {filterMode && (
            <button onClick={() => setFilterMode(null)} className="text-[10px] text-primary hover:underline font-bold">Clear Filter</button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {MODES.map(m => {
            const count = allPayments.filter((p: any) => (p.payment_mode || p.payment_method || '').toLowerCase() === m.toLowerCase()).length;
            const total = allPayments.filter((p: any) => (p.payment_mode || p.payment_method || '').toLowerCase() === m.toLowerCase()).reduce((s: number, p: any) => s + Number(p.payment_amount), 0);
            const isActive = filterMode?.toLowerCase() === m.toLowerCase();
            
            return (
              <button 
                key={m} 
                onClick={() => setFilterMode(isActive ? null : m)}
                className={`flex flex-col items-start min-w-[80px] border rounded-lg px-3 py-2 text-left transition-all ${
                  isActive 
                    ? 'bg-primary border-primary text-primary-foreground shadow-md ring-2 ring-primary/20 scale-105' 
                    : 'bg-card border-border hover:border-primary/50 text-foreground'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase transition-colors ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{m}</span>
                <span className="text-sm font-bold font-mono">₹{total.toLocaleString()}</span>
                <span className={`text-[10px] transition-colors ${isActive ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{count} payments</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Tenant</th>
              <th className="text-left px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Flat</th>
              <th className="text-left px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider w-28">Date</th>
              <th className="text-right px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider w-24">Amount</th>
              <th className="text-center px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider w-24">Method</th>
              <th className="text-center px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider w-24">Status</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p: any) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{(p as any).tenants?.full_name || '—'}</td>
                <td className="px-4 py-3 font-mono text-muted-foreground text-xs">{(p as any).flats?.flat_number || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{format(new Date(p.payment_date), 'MMM dd, yyyy')}</td>
                <td className="px-4 py-3 text-right font-bold font-mono">₹{Number(p.payment_amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="outline" className="text-[10px] font-bold px-1.5 h-5 bg-muted/50">{p.payment_mode || p.payment_method}</Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${
                    p.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                    p.payment_status === 'late' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{p.payment_status}</span>
                </td>
                <td className="px-3 py-2 flex gap-1 justify-end">
                  <button 
                    onClick={() => {
                      const name = p.tenants?.full_name;
                      const building = p.flats?.buildings?.name;
                      const flatNo = p.flats?.flat_number;
                      const floor = p.flats?.floor || 'N/A';
                      const amount = Number(p.payment_amount).toLocaleString();
                      const date = format(new Date(p.payment_date), 'MMMM yyyy');
                      const phone = p.tenants?.phone;

                      if (!phone) {
                        toast({ title: 'No phone number', variant: 'destructive' });
                        return;
                      }

                      let msg = "";
                      if (p.payment_status === 'paid') {
                        msg = `Hi ${name}, your payment of ₹${amount} for ${building}, Floor ${floor}, Flat ${flatNo} for the month of ${date} has been received. Thank you!`;
                      } else {
                        msg = `Hi ${name}, reminder for rent payment of ₹${amount} for ${building}, Floor ${floor}, Flat ${flatNo} for the month of ${date}. Thank you!`;
                      }

                      window.open(`https://wa.me/${phone.startsWith('+') ? phone : '91' + phone}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="p-1 rounded hover:bg-green-50 text-green-600"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => { setEditId(p.id); setTenantId(p.tenant_id); setFlatId(p.flat_id || ''); setAmount(String(p.payment_amount)); setDate(p.payment_date); setStatus(p.payment_status); setMode(p.payment_mode || p.payment_method || 'Cash'); setOpen(true); }} className="p-1 rounded hover:bg-muted"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <button onClick={() => deleteMutation.mutate(p.id)} className="p-1 rounded hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                </td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-muted-foreground text-xs">No payments</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
