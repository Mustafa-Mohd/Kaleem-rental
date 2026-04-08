import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Pencil } from 'lucide-react';

export default function ManageTenants() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [flatId, setFlatId] = useState('');
  const [rent, setRent] = useState('0');
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseEnd, setLeaseEnd] = useState('');

  const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');

  const { data: flats = [] } = useQuery({
    queryKey: ['flats'],
    queryFn: async () => { 
      const local = getLocal('local_flats');
      if (local.length > 0) return local;
      const { data } = await supabase.from('flats').select('*, buildings(name)').order('flat_number'); 
      return data || []; 
    },
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => { 
      const localT = getLocal('local_tenants');
      if (localT.length > 0) {
        const localF = getLocal('local_flats');
        const localB = getLocal('local_buildings');
        return localT.map((t: any) => {
          const flat = localF.find((f: any) => f.id === t.flat_id);
          const building = localB.find((b: any) => b.id === flat?.building_id);
          return {
            ...t,
            flats: {
              flat_number: flat?.flat_number || '?',
              buildings: { name: building?.name || '?' }
            }
          };
        }).sort((a: any, b: any) => a.full_name.localeCompare(b.full_name));
      }
      const { data } = await supabase.from('tenants').select('*, flats(flat_number, building_id, buildings(name))').order('full_name'); 
      return data || []; 
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = { full_name: fullName, phone, email, flat_id: flatId || null, rent_amount: Number(rent), lease_start: leaseStart || null, lease_end: leaseEnd || null };
      if (editId) {
        const { error } = await supabase.from('tenants').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('tenants').insert(payload);
        if (error) throw error;
      }
      if (flatId) {
        await supabase.from('flats').update({ occupancy_status: 'occupied' }).eq('id', flatId);
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tenants'] }); qc.invalidateQueries({ queryKey: ['flats'] }); toast({ title: editId ? 'Updated' : 'Added' }); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (t: any) => {
      if (t.flat_id) await supabase.from('flats').update({ occupancy_status: 'vacant' }).eq('id', t.flat_id);
      const { error } = await supabase.from('tenants').delete().eq('id', t.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tenants'] }); qc.invalidateQueries({ queryKey: ['flats'] }); toast({ title: 'Removed' }); },
  });

  const resetForm = () => { setOpen(false); setEditId(null); setFullName(''); setPhone(''); setEmail(''); setFlatId(''); setRent('0'); setLeaseStart(''); setLeaseEnd(''); };
  const openEdit = (t: any) => { setEditId(t.id); setFullName(t.full_name); setPhone(t.phone || ''); setEmail(t.email || ''); setFlatId(t.flat_id || ''); setRent(String(t.rent_amount)); setLeaseStart(t.lease_start || ''); setLeaseEnd(t.lease_end || ''); setOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Tenants</h1>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); else setOpen(true); }}>
          <DialogTrigger asChild><Button size="sm" className="text-xs"><Plus className="h-3.5 w-3.5 mr-1" />Add</Button></DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-sm">{editId ? 'Edit' : 'Add'} Tenant</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className="text-sm" />
              <Input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="text-sm" />
              <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="text-sm" />
              <Select value={flatId} onValueChange={(v) => { setFlatId(v); const f = flats.find((x: any) => x.id === v); if (f) setRent(String(f.rent_amount)); }}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Assign Flat" /></SelectTrigger>
                <SelectContent>{flats.map((f: any) => <SelectItem key={f.id} value={f.id}>{(f as any).buildings?.name} — {f.flat_number}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" placeholder="Rent ₹" value={rent} onChange={e => setRent(e.target.value)} className="text-sm" />
              <div className="flex gap-2">
                <Input type="date" placeholder="Lease Start" value={leaseStart} onChange={e => setLeaseStart(e.target.value)} className="text-sm" />
                <Input type="date" placeholder="Lease End" value={leaseEnd} onChange={e => setLeaseEnd(e.target.value)} className="text-sm" />
              </div>
              <Button size="sm" className="w-full text-xs" onClick={() => saveMutation.mutate()} disabled={!fullName}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Full Name</th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground w-1/4">Property / Flat</th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground w-28 text-center">Phone</th>
              <th className="text-right px-3 py-2 font-medium text-muted-foreground w-24">Rent</th>
              <th className="text-center px-3 py-2 font-medium text-muted-foreground w-24">Starts</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t: any) => (
              <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="px-3 py-2 font-medium">{t.full_name}</td>
                <td className="px-3 py-2 text-xs">
                  <span className="font-bold text-primary">{(t as any).flats?.buildings?.name}</span>
                  <span className="mx-1 text-muted-foreground">/</span>
                  <span className="font-mono text-[10px]">{(t as any).flats?.flat_number}</span>
                </td>
                <td className="px-3 py-2 text-center font-mono text-[11px] text-muted-foreground">{t.phone || '—'}</td>
                <td className="px-3 py-2 text-right font-mono text-xs">₹{Number(t.rent_amount).toLocaleString()}</td>
                <td className="px-3 py-2 text-center text-xs text-muted-foreground">{t.lease_start || '—'}</td>
                <td className="px-3 py-2 flex gap-1 justify-end">
                  <button onClick={() => openEdit(t)} className="p-1 rounded hover:bg-muted"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <button onClick={() => deleteMutation.mutate(t)} className="p-1 rounded hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground text-xs">No tenants</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
