import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Pencil } from 'lucide-react';

export default function ManageBuildings() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [floors, setFloors] = useState('1');
  const [numFlats, setNumFlats] = useState('1');

  const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');

  const { data: buildings = [] } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const local = getLocal('local_buildings');
      if (local.length > 0) return local;
      const { data } = await supabase.from('buildings').select('*').order('name');
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { name, address, city, num_floors: Number(floors), num_flats: Number(numFlats) };
      if (editId) {
        const { error } = await supabase.from('buildings').update(payload).eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('buildings').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['buildings'] });
      toast({ title: editId ? 'Updated' : 'Added' });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const local = getLocal('local_buildings');
      if (local.length > 0) {
        localStorage.setItem('local_buildings', JSON.stringify(local.filter((b: any) => b.id !== id)));
        return;
      }
      const { error } = await supabase.from('buildings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['buildings'] });
      toast({ title: 'Deleted' });
    },
  });

  const resetForm = () => { setOpen(false); setEditId(null); setName(''); setAddress(''); setCity(''); setFloors('1'); setNumFlats('1'); };
  const openEdit = (b: any) => { setEditId(b.id); setName(b.name); setAddress(b.address); setCity(b.city); setFloors(String(b.num_floors)); setNumFlats(String(b.num_flats)); setOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Buildings</h1>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); else setOpen(true); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs"><Plus className="h-3.5 w-3.5 mr-1" />Add</Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-sm">{editId ? 'Edit' : 'Add'} Building</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="text-sm" />
              <Input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} className="text-sm" />
              <Input placeholder="City" value={city} onChange={e => setCity(e.target.value)} className="text-sm" />
              <div className="flex gap-2">
                <Input type="number" placeholder="Floors" value={floors} onChange={e => setFloors(e.target.value)} className="text-sm" />
                <Input type="number" placeholder="Flats" value={numFlats} onChange={e => setNumFlats(e.target.value)} className="text-sm" />
              </div>
              <Button size="sm" className="w-full text-xs" onClick={() => saveMutation.mutate()} disabled={!name || !address || !city}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Address</th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">City</th>
              <th className="text-center px-3 py-2 font-medium text-muted-foreground w-16">Floors</th>
              <th className="text-center px-3 py-2 font-medium text-muted-foreground w-16">Flats</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {buildings.map((b: any) => (
              <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30">
                <td className="px-3 py-2 font-medium">{b.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{b.address}</td>
                <td className="px-3 py-2 text-muted-foreground">{b.city}</td>
                <td className="px-3 py-2 text-center">{b.num_floors}</td>
                <td className="px-3 py-2 text-center">{b.num_flats}</td>
                <td className="px-3 py-2 flex gap-1 justify-end">
                  <button onClick={() => openEdit(b)} className="p-1 rounded hover:bg-muted"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  <button onClick={() => deleteMutation.mutate(b.id)} className="p-1 rounded hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                </td>
              </tr>
            ))}
            {buildings.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-xs">No buildings</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
