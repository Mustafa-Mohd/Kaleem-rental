import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Pencil } from 'lucide-react';

export default function ManageFlats() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [flatNumber, setFlatNumber] = useState('');
  const [floor, setFloor] = useState('0');
  const [rent, setRent] = useState('0');
  const [buildingId, setBuildingId] = useState('');
  const [status, setStatus] = useState('vacant');

  const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');

  const { data: buildings = [] } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => { 
      const local = getLocal('local_buildings');
      if (local.length > 0) return local;
      const { data } = await supabase.from('buildings').select('id, name'); 
      return data || []; 
    },
  });

  const { data: flats = [] } = useQuery({
    queryKey: ['flats'],
    queryFn: async () => { 
      const localF = getLocal('local_flats');
      if (localF.length > 0) {
        const localB = getLocal('local_buildings');
        return localF.map((f: any) => ({
          ...f,
          buildings: { name: localB.find((b: any) => b.id === f.building_id)?.name || 'Unknown' }
        })).sort((a: any, b: any) => (a.buildings?.name || "").localeCompare(b.buildings?.name || "") || a.flat_number.localeCompare(b.flat_number));
      }
      const { data } = await supabase.from('flats').select('*, buildings(name)').order('flat_number'); 
      return data || []; 
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { flat_number: flatNumber, floor: Number(floor), rent_amount: Number(rent), building_id: buildingId, occupancy_status: status };
      if (editId) {
        const { error } = await supabase.from('flats').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('flats').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['flats'] }); toast({ title: editId ? 'Updated' : 'Added' }); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('flats').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['flats'] }); toast({ title: 'Deleted' }); },
  });

  const resetForm = () => { setOpen(false); setEditId(null); setFlatNumber(''); setFloor('0'); setRent('0'); setBuildingId(''); setStatus('vacant'); };
  const openEdit = (f: any) => { setEditId(f.id); setFlatNumber(f.flat_number); setFloor(String(f.floor)); setRent(String(f.rent_amount)); setBuildingId(f.building_id); setStatus(f.occupancy_status); setOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Flats</h1>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); else setOpen(true); }}>
          <DialogTrigger asChild><Button size="sm" className="text-xs"><Plus className="h-3.5 w-3.5 mr-1" />Add</Button></DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-sm">{editId ? 'Edit' : 'Add'} Flat</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={buildingId} onValueChange={setBuildingId}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Building" /></SelectTrigger>
                <SelectContent>{buildings.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Flat No" value={flatNumber} onChange={e => setFlatNumber(e.target.value)} className="text-sm" />
              <div className="flex gap-2">
                <Input type="number" placeholder="Floor" value={floor} onChange={e => setFloor(e.target.value)} className="text-sm" />
                <Input type="number" placeholder="Rent ₹" value={rent} onChange={e => setRent(e.target.value)} className="text-sm" />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacant">Vacant</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" className="w-full text-xs" onClick={() => saveMutation.mutate()} disabled={!flatNumber || !buildingId}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-3 py-2 font-medium text-muted-foreground w-1/3">Building</th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Flat No</th>
              <th className="text-center px-3 py-2 font-medium text-muted-foreground w-20">Floor</th>
              <th className="text-right px-3 py-2 font-medium text-muted-foreground w-28">Base Rent</th>
              <th className="text-center px-3 py-2 font-medium text-muted-foreground w-28">Status</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {flats.map((f: any) => (
              <tr key={f.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="px-3 py-2 font-medium">{(f as any).buildings?.name || '—'}</td>
                <td className="px-3 py-2 font-mono text-xs font-bold">{f.flat_number}</td>
                <td className="px-3 py-2 text-center text-xs">{f.floor}</td>
                <td className="px-3 py-2 text-right font-mono">₹{Number(f.rent_amount).toLocaleString()}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${f.occupancy_status === 'occupied' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {f.occupancy_status}
                  </span>
                </td>
                <td className="px-3 py-2 flex gap-1 justify-end">
                  <button onClick={() => openEdit(f)} className="p-1 rounded hover:bg-muted"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <button onClick={() => deleteMutation.mutate(f.id)} className="p-1 rounded hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                </td>
              </tr>
            ))}
            {flats.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-xs">No flats</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
