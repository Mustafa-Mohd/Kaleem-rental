import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Layers, Home, Plus, Upload, Trash2, Edit2, Image } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function Buildings() {
  const [showAdd, setShowAdd] = useState(false);
  const [editBuilding, setEditBuilding] = useState<any>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [numFloors, setNumFloors] = useState('1');
  const [numFlats, setNumFlats] = useState('1');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: buildings = [], isLoading } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('buildings').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    const ext = imageFile.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('building-images').upload(path, imageFile);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('building-images').getPublicUrl(path);
    return urlData.publicUrl;
  };

  const resetForm = () => {
    setName(''); setAddress(''); setCity(''); setNumFloors('1'); setNumFlats('1');
    setImageFile(null); setImagePreview(null); setEditBuilding(null);
  };

  const addMutation = useMutation({
    mutationFn: async () => {
      setUploading(true);
      const imageUrl = await uploadImage();
      const { error } = await supabase.from('buildings').insert({
        name, address, city,
        num_floors: parseInt(numFloors) || 1,
        num_flats: parseInt(numFlats) || 1,
        user_id: user!.id,
        image_url: imageUrl,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast({ title: 'Building added', description: `${name} has been created.` });
      setShowAdd(false); resetForm();
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    onSettled: () => setUploading(false),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      setUploading(true);
      let imageUrl = editBuilding.image_url;
      if (imageFile) imageUrl = await uploadImage();
      const { error } = await supabase.from('buildings').update({
        name, address, city,
        num_floors: parseInt(numFloors) || 1,
        num_flats: parseInt(numFlats) || 1,
        image_url: imageUrl,
      }).eq('id', editBuilding.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast({ title: 'Building updated' });
      setEditBuilding(null); setShowAdd(false); resetForm();
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    onSettled: () => setUploading(false),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('buildings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast({ title: 'Building deleted' });
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const openEdit = (b: any) => {
    setEditBuilding(b);
    setName(b.name); setAddress(b.address); setCity(b.city);
    setNumFloors(String(b.num_floors)); setNumFlats(String(b.num_flats));
    setImagePreview(b.image_url || null);
    setShowAdd(true);
  };

  const isEditing = !!editBuilding;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Buildings</h1>
          <p className="text-muted-foreground mt-1">{buildings.length} properties managed</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAdd(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> Add Building
        </Button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3].map(i => (
            <Card key={i} className="border-border/50 h-64 animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {buildings.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="hover-lift border-border/50 h-full overflow-hidden group">
                <div className="h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-accent relative overflow-hidden">
                  {(b as any).image_url ? (
                    <img src={(b as any).image_url} alt={b.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="h-16 w-16 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openEdit(b); }}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); if (confirm('Delete this building?')) deleteMutation.mutate(b.id); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-foreground text-lg">{b.name}</h3>
                    <Badge variant="secondary" className="text-xs shrink-0">{b.city}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{b.address}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Layers className="h-3.5 w-3.5" />
                      <span>{b.num_floors} floors</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Home className="h-3.5 w-3.5" />
                      <span>{b.num_flats} flats</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Added {format(new Date(b.created_at), 'MMM dd, yyyy')}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={(open) => { if (!open) { setShowAdd(false); resetForm(); } else setShowAdd(true); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Building' : 'Add New Building'}</DialogTitle>
            <DialogDescription>{isEditing ? 'Update the building details.' : 'Enter the building details below.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Building Image</Label>
              <div
                className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                    <Button
                      size="icon" variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <Image className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload image</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Building Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sunrise Towers" />
            </div>
            <div className="space-y-2">
              <Label>Address *</Label>
              <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 42 Marine Drive" />
            </div>
            <div className="space-y-2">
              <Label>City *</Label>
              <Input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Mumbai" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>No. of Floors</Label>
                <Input type="number" min="1" value={numFloors} onChange={e => setNumFloors(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>No. of Flats</Label>
                <Input type="number" min="1" value={numFlats} onChange={e => setNumFlats(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); resetForm(); }}>Cancel</Button>
            <Button
              onClick={() => isEditing ? updateMutation.mutate() : addMutation.mutate()}
              disabled={!name || !address || !city || uploading || addMutation.isPending || updateMutation.isPending}
            >
              {uploading ? 'Uploading...' : isEditing ? 'Save Changes' : 'Add Building'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
