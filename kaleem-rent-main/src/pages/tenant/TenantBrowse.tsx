import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Home, IndianRupee, Layers, Send, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function TenantBrowse() {
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedFlat, setSelectedFlat] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: buildings = [] } = useQuery({
    queryKey: ['browse-buildings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('buildings').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: flats = [] } = useQuery({
    queryKey: ['browse-flats', selectedBuilding?.id],
    queryFn: async () => {
      if (!selectedBuilding) return [];
      const { data, error } = await supabase.from('flats').select('*').eq('building_id', selectedBuilding.id).order('flat_number');
      if (error) throw error;
      return data;
    },
    enabled: !!selectedBuilding,
  });

  const { data: myRequests = [] } = useQuery({
    queryKey: ['my-requests'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tenant_requests').select('*, flats(flat_number, buildings(name))').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const requestMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('tenant_requests').insert({
        user_id: user!.id,
        flat_id: selectedFlat.id,
        full_name: fullName,
        email: email || user?.email,
        phone, message,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
      toast({ title: 'Request sent! 🎉', description: 'The admin will review your request.' });
      setShowRequestDialog(false);
      setFullName(''); setEmail(''); setPhone(''); setMessage('');
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const openRequest = (flat: any) => {
    setSelectedFlat(flat);
    setEmail(user?.email || '');
    setShowRequestDialog(true);
  };

  const filteredBuildings = buildings.filter((b: any) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.city.toLowerCase().includes(search.toLowerCase())
  );

  const vacantFlats = flats.filter(f => f.occupancy_status === 'vacant');
  const avgRent = flats.length > 0 ? Math.round(flats.reduce((s, f) => s + Number(f.rent_amount), 0) / flats.length) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Browse Properties</h1>
        <p className="text-muted-foreground mt-1">Explore available buildings and request to rent a flat</p>
      </div>

      {!selectedBuilding ? (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or city..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>

          {filteredBuildings.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <Building2 className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-1">No properties available</h3>
                <p className="text-muted-foreground">Check back later for new listings</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredBuildings.map((b: any, i: number) => (
                <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="hover-lift border-border/50 cursor-pointer overflow-hidden" onClick={() => setSelectedBuilding(b)}>
                    <div className="h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-accent relative overflow-hidden">
                      {b.image_url ? (
                        <img src={b.image_url} alt={b.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="h-16 w-16 text-primary/30" />
                        </div>
                      )}
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
                      <Button variant="ghost" className="w-full justify-between text-primary hover:text-primary" size="sm">
                        View Available Flats <ChevronRight className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setSelectedBuilding(null)}>← Back</Button>
            <div>
              <h2 className="text-xl font-bold text-foreground">{selectedBuilding.name}</h2>
              <p className="text-sm text-muted-foreground">{selectedBuilding.address}, {selectedBuilding.city} • {vacantFlats.length} vacant • Avg rent: ₹{avgRent.toLocaleString()}/mo</p>
            </div>
          </div>

          {selectedBuilding.image_url && (
            <div className="rounded-xl overflow-hidden h-48">
              <img src={selectedBuilding.image_url} alt={selectedBuilding.name} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Flats', value: flats.length, color: 'text-primary' },
              { label: 'Vacant', value: vacantFlats.length, color: 'text-success' },
              { label: 'Avg Rent', value: `₹${avgRent.toLocaleString()}`, color: 'text-foreground' },
            ].map((s, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-4 text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {flats.map((f, i) => {
              const isVacant = f.occupancy_status === 'vacant';
              const alreadyRequested = myRequests.some(r => r.flat_id === f.id && r.status === 'pending');
              return (
                <motion.div key={f.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className={`border-border/50 ${isVacant ? 'hover-lift' : 'opacity-60'}`}>
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Home className={`h-5 w-5 ${isVacant ? 'text-success' : 'text-muted-foreground'}`} />
                          <span className="font-semibold text-foreground text-lg">{f.flat_number}</span>
                        </div>
                        <Badge variant={isVacant ? 'default' : 'secondary'} className={isVacant ? 'bg-success text-success-foreground' : ''}>
                          {f.occupancy_status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Floor {f.floor}</span>
                        <div className="flex items-center gap-1 font-semibold text-foreground">
                          <IndianRupee className="h-3.5 w-3.5" />
                          {Number(f.rent_amount).toLocaleString()}/mo
                        </div>
                      </div>
                      {isVacant && (
                        alreadyRequested ? (
                          <Badge variant="secondary" className="w-full justify-center py-1.5">Request Pending</Badge>
                        ) : (
                          <Button className="w-full gap-2" size="sm" onClick={() => openRequest(f)}>
                            <Send className="h-3.5 w-3.5" /> Request to Rent
                          </Button>
                        )
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* My Requests */}
      {myRequests.length > 0 && !selectedBuilding && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">My Requests</h2>
          <div className="space-y-2">
            {myRequests.map(r => (
              <div key={r.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <Home className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{(r.flats as any)?.flat_number} — {(r.flats as any)?.buildings?.name}</p>
                  <p className="text-xs text-muted-foreground">{r.message || 'No message'}</p>
                </div>
                <Badge variant={r.status === 'approved' ? 'default' : r.status === 'rejected' ? 'destructive' : 'secondary'}>
                  {r.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request to Rent</DialogTitle>
            <DialogDescription>
              Apply for flat {selectedFlat?.flat_number} — ₹{Number(selectedFlat?.rent_amount || 0).toLocaleString()}/mo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Your phone number" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Message (optional)</Label>
              <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Why you're interested..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>Cancel</Button>
            <Button onClick={() => requestMutation.mutate()} disabled={!fullName || !phone || requestMutation.isPending}>
              {requestMutation.isPending ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
