import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function ManageExpenses() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [buildingId, setBuildingId] = useState('');
  const [month, setMonth] = useState(format(new Date(), 'MMMM-yy').toUpperCase());
  const [watchmen, setWatchmen] = useState('0');
  const [electricity, setElectricity] = useState('0');
  const [water, setWater] = useState('0');
  const [other, setOther] = useState('0');

  const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
  const setLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  const { data: buildings = [] } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => { 
      const local = getLocal('local_buildings');
      if (local.length > 0) return local;
      const { data } = await supabase.from('buildings').select('id, name').order('name'); 
      return data || []; 
    },
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => { 
      const local = getLocal('local_expenses');
      if (local.length > 0) return local;
      const { data } = await supabase.from('building_expenses').select('*, buildings:building_id(name)').order('month', { ascending: false }); 
      return data || []; 
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { id: editId || crypto.randomUUID(), building_id: buildingId, month, watchmen_salary: Number(watchmen), electricity_bill: Number(electricity), water_bill: Number(water), other_expenses: Number(other), buildings: { name: buildings.find((b: any) => b.id === buildingId)?.name } };
      
      const local = getLocal('local_expenses');
      if (editId) {
        const updated = local.map((e: any) => e.id === editId ? payload : e);
        setLocal('local_expenses', updated);
      } else {
        setLocal('local_expenses', [...local, payload]);
      }

      // Try background sync to supabase but don't wait/fail
      supabase.from('building_expenses').upsert({ building_id: buildingId, month, watchmen_salary: Number(watchmen), electricity_bill: Number(electricity), water_bill: Number(water), other_expenses: Number(other) }).then();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); toast({ title: editId ? 'Updated Locally' : 'Added Locally' }); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from('building_expenses').delete().eq('id', id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['expenses'] }); toast({ title: 'Deleted' }); },
  });

  const resetForm = () => { setOpen(false); setEditId(null); setBuildingId(''); setMonth(format(new Date(), 'MMMM-yy').toUpperCase()); setWatchmen('0'); setElectricity('0'); setWater('0'); setOther('0'); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Building Expenses</h1>
        <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); else setOpen(true); }}>
          <DialogTrigger asChild><Button size="sm" className="text-xs"><Plus className="h-3.5 w-3.5 mr-1" />Add</Button></DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-sm">{editId ? 'Edit' : 'Add'} Expense</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1 mt-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Building</p>
                <Select value={buildingId} onValueChange={setBuildingId}>
                  <SelectTrigger className="text-sm border-2"><SelectValue placeholder="Select Building" /></SelectTrigger>
                  <SelectContent>{buildings.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Month Period</p>
                <Input placeholder="e.g. APRIL-26" value={month} onChange={e => setMonth(e.target.value)} className="text-sm border-2 font-mono uppercase" />
              </div>
              
              <div className="border-t border-dashed border-border pt-3 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold text-foreground min-w-[120px]">Watchmen Salary :</p>
                  <Input type="number" value={watchmen} onChange={e => setWatchmen(e.target.value)} className="text-sm h-8 border-b-2 border-t-0 border-x-0 rounded-none shadow-none focus-visible:ring-0 px-1 font-mono" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold text-foreground min-w-[120px]">Electricity Bill :</p>
                  <Input type="number" value={electricity} onChange={e => setElectricity(e.target.value)} className="text-sm h-8 border-b-2 border-t-0 border-x-0 rounded-none shadow-none focus-visible:ring-0 px-1 font-mono" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold text-foreground min-w-[120px]">Water Bill :</p>
                  <Input type="number" value={water} onChange={e => setWater(e.target.value)} className="text-sm h-8 border-b-2 border-t-0 border-x-0 rounded-none shadow-none focus-visible:ring-0 px-1 font-mono" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold text-foreground min-w-[120px]">Other Exp :</p>
                  <Input type="number" value={other} onChange={e => setOther(e.target.value)} className="text-sm h-8 border-b-2 border-t-0 border-x-0 rounded-none shadow-none focus-visible:ring-0 px-1 font-mono" />
                </div>
              </div>
              
              <Button size="sm" className="w-full text-xs font-bold uppercase tracking-widest mt-4 h-10" onClick={() => saveMutation.mutate()} disabled={!buildingId}>Save Expenses</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Building</th>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground w-28">Month</th>
              <th className="text-right px-3 py-2 font-medium text-muted-foreground w-24">Watchmen</th>
              <th className="text-right px-3 py-2 font-medium text-muted-foreground w-24">Electricity</th>
              <th className="text-right px-3 py-2 font-medium text-muted-foreground w-24">Water</th>
              <th className="text-right px-3 py-2 font-medium text-muted-foreground w-24">Other</th>
              <th className="text-right px-3 py-2 font-medium text-muted-foreground w-24">Total</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e: any) => {
              const total = Number(e.watchmen_salary) + Number(e.electricity_bill) + Number(e.water_bill) + Number(e.other_expenses);
              return (
                <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">{(e as any).buildings?.name || '—'}</td>
                  <td className="px-3 py-2 font-mono text-xs">{e.month}</td>
                  <td className="px-3 py-2 text-right font-mono">₹{Number(e.watchmen_salary).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono">₹{Number(e.electricity_bill).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono">₹{Number(e.water_bill).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono">₹{Number(e.other_expenses).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold">₹{total.toLocaleString()}</td>
                  <td className="px-3 py-2 flex gap-1 justify-end">
                    <button onClick={() => { setEditId(e.id); setBuildingId(e.building_id); setMonth(e.month); setWatchmen(String(e.watchmen_salary)); setElectricity(String(e.electricity_bill)); setWater(String(e.water_bill)); setOther(String(e.other_expenses)); setOpen(true); }} className="p-1 rounded hover:bg-muted"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    <button onClick={() => deleteMutation.mutate(e.id)} className="p-1 rounded hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                  </td>
                </tr>
              );
            })}
            {expenses.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-muted-foreground text-xs">No expenses recorded</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
