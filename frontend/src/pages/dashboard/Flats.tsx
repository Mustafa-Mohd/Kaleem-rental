import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Building2, IndianRupee, Plus, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Flats() {
  const [showAdd, setShowAdd] = useState(false);
  const [editFlat, setEditFlat] = useState<any>(null);
  const [flatNumber, setFlatNumber] = useState('');
  const [floor, setFloor] = useState('0');
  const [rentAmount, setRentAmount] = useState('0');
  const [buildingId, setBuildingId] = useState('');
  const [occupancyStatus, setOccupancyStatus] = useState('vacant');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: flats = [], isLoading } = useQuery({
    queryKey: ['flats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('flats').select('*, buildings(name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('buildings').select('id, name');
      if (error) throw error;
      return data;
    },
  });

  const resetForm = () => {
    setFlatNumber(''); setFloor('0'); setRentAmount('0'); setBuildingId(''); setOccupancyStatus('vacant'); setEditFlat(null);
  };

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('flats').insert({
        flat_number: flatNumber, floor: parseInt(floor) || 0,
        rent_amount: parseInt(rentAmount) || 0, building_id: buildingId,
        occupancy_status: 'vacant',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flats'] });
      toast({ title: 'Flat added' });
      setShowAdd(false); resetForm();
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('flats').update({
        flat_number: flatNumber, floor: parseInt(floor) || 0,
        rent_amount: parseInt(rentAmount) || 0, building_id: buildingId,
        occupancy_status: occupancyStatus,
      }).eq('id', editFlat.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flats'] });
      toast({ title: 'Flat updated' });
      setShowAdd(false); resetForm();
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('flats').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flats'] });
      toast({ title: 'Flat deleted' });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const openEdit = (f: any) => {
    setEditFlat(f);
    setFlatNumber(f.flat_number); setFloor(String(f.floor)); setRentAmount(String(f.rent_amount));
    setBuildingId(f.building_id); setOccupancyStatus(f.occupancy_status);
    setShowAdd(true);
  };

  const occupied = flats.filter(f => f.occupancy_status === 'occupied').length;
  const isEditing = !!editFlat;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Flats</h1>
          <p className="text-muted-foreground mt-1">{flats.length} flats • {occupied} occupied • {flats.length - occupied} vacant</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAdd(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Flat
        </Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flat</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
              ) : flats.map((f) => (
                <TableRow key={f.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{f.flat_number}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      {(f.buildings as any)?.name || '—'}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">Floor {f.floor}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-foreground font-medium">
                      <IndianRupee className="h-3.5 w-3.5" />
                      {Number(f.rent_amount).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={f.occupancy_status === 'occupied' ? 'default' : 'secondary'}>
                      {f.occupancy_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(f)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => { if (confirm('Delete this flat?')) deleteMutation.mutate(f.id); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={(open) => { if (!open) { setShowAdd(false); resetForm(); } else setShowAdd(true); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Flat' : 'Add New Flat'}</DialogTitle>
            <DialogDescription>{isEditing ? 'Update flat details.' : 'Assign a flat to a building.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Building *</Label>
              <Select value={buildingId} onValueChange={setBuildingId}>
                <SelectTrigger><SelectValue placeholder="Select building" /></SelectTrigger>
                <SelectContent>
                  {buildings.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Flat Number *</Label>
              <Input value={flatNumber} onChange={e => setFlatNumber(e.target.value)} placeholder="e.g. A-101" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Floor</Label>
                <Input type="number" min="0" value={floor} onChange={e => setFloor(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Rent Amount (₹)</Label>
                <Input type="number" min="0" value={rentAmount} onChange={e => setRentAmount(e.target.value)} />
              </div>
            </div>
            {isEditing && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={occupancyStatus} onValueChange={setOccupancyStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacant">Vacant</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); resetForm(); }}>Cancel</Button>
            <Button
              onClick={() => isEditing ? updateMutation.mutate() : addMutation.mutate()}
              disabled={!flatNumber || !buildingId || addMutation.isPending || updateMutation.isPending}
            >
              {isEditing ? (updateMutation.isPending ? 'Saving...' : 'Save Changes') : (addMutation.isPending ? 'Adding...' : 'Add Flat')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
