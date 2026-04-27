import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Home, User, ChevronLeft, CreditCard, CalendarDays, MapPin, Hash, IndianRupee, Database, RefreshCw, MessageSquare, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type ViewState = 'buildings' | 'flats' | 'tenant';

const LEDGER_DATA = [
  {
    name: 'GAYATRI - 367',
    flats: [
      { flat: '101', tenant: 'coconut shop', floor: 1 },
      { flat: '201', tenant: 'Surendra Varma', floor: 2 },
      { flat: '202', tenant: 'Khana Sharma', floor: 2 },
      { flat: '301', tenant: 'Iqbal Ahemad', floor: 3 },
      { flat: '401', tenant: 'Kamlesh', floor: 4 },
      { flat: '402', tenant: 'Nithin', floor: 4 },
      { flat: 'pent', tenant: 'Dharani', floor: 5 },
      { flat: 'shop1', tenant: 'Dry fruit', floor: 0 },
      { flat: 'shop2', tenant: 'Vinni studio', floor: 0 }
    ]
  },
  {
    name: 'KY Residency - 501',
    flats: [
      { flat: '101', tenant: 'Chaitanya', floor: 1 },
      { flat: '102', tenant: 'Subash', floor: 1 },
      { flat: '201', tenant: 'Sundar', floor: 2 },
      { flat: '202', tenant: 'Sayantan', floor: 2 },
      { flat: '301', tenant: 'Sharath', floor: 3 },
      { flat: '302', tenant: 'Anurag', floor: 3 },
      { flat: '401', tenant: 'Abhishek', floor: 4 },
      { flat: '402', tenant: 'Anil', floor: 4 }
    ]
  },
  {
    name: 'SR NAGAR - 206',
    flats: [
      { flat: 'GF', tenant: 'Paresh Tripati', floor: 0 },
      { flat: '101', tenant: 'N. Krishna Reddy', floor: 1 },
      { flat: '102', tenant: 'Kishore', floor: 1 },
      { flat: '103', tenant: 'Eshwarama', floor: 1 },
      { flat: '201', tenant: 'Rishab', floor: 2 },
      { flat: '202', tenant: 'Roshan', floor: 2 },
      { flat: '203', tenant: 'Praveen Reddy', floor: 2 },
      { flat: '301', tenant: 'Amit Kumar Tripati', floor: 3 },
      { flat: '302', tenant: 'Yoga Nanda / Bhargav', floor: 3 },
      { flat: '303', tenant: 'Charan', floor: 3 },
      { flat: '401', tenant: 'Franklin', floor: 4 },
      { flat: '402', tenant: 'Yasin', floor: 4 }
    ]
  },
  {
    name: 'Lake View Residency',
    flats: [
      { flat: '101', tenant: 'General Tenant 1', floor: 1 },
      { flat: '102', tenant: 'General Tenant 2', floor: 1 }
    ]
  },
  {
    name: 'NETAJI NAGAR - 217',
    flats: [
      { flat: '101', tenant: 'Nizamuddin', floor: 1 },
      { flat: '102', tenant: 'Asif Shaik', floor: 1 },
      { flat: '201', tenant: 'Praveen', floor: 2 },
      { flat: '202', tenant: 'Shaik Gause', floor: 2 },
      { flat: '301', tenant: 'Mohammed Nazim', floor: 3 },
      { flat: '302', tenant: 'Krishna Kumar', floor: 3 },
      { flat: 'P House', tenant: 'Subash Verma', floor: 4 },
      { flat: 'GF', tenant: 'Mamata', floor: 0 }
    ]
  }
];

export default function BuildingExplorer() {
  const [view, setView] = useState<ViewState>('buildings');
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [whatsappTemplate, setWhatsappTemplate] = useState('payment_done');
  const { toast } = useToast();
  const qc = useQueryClient();

  // Auto-seed data on first load if localStorage is empty
  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem('local_buildings') || '[]');
    if (existing.length > 0) return; // already seeded

    const bList: any[] = [];
    const fList: any[] = [];
    const tList: any[] = [];
    const pList: any[] = [];
    const eList: any[] = [];
    const currentMonth = format(new Date(), 'MMMM-yy').toUpperCase();

    for (const bData of LEDGER_DATA) {
      const bId = crypto.randomUUID();
      bList.push({ id: bId, name: bData.name, city: 'Hyderabad',
        address: bData.name.includes('GAYATRI') ? '367' : bData.name.includes('KY') ? '501' : bData.name.includes('SR NAGAR') ? '206' : '217'
      });
      eList.push({
        id: crypto.randomUUID(), building_id: bId, month: currentMonth,
        watchmen_salary: 8000 + (Math.floor(Math.random() * 4) * 500),
        electricity_bill: 1500 + (Math.floor(Math.random() * 10) * 100),
        water_bill: 500 + (Math.floor(Math.random() * 5) * 100),
        other_expenses: 200 + (Math.floor(Math.random() * 5) * 50),
        buildings: { name: bData.name }
      });
      for (const fData of bData.flats) {
        const fId = crypto.randomUUID();
        const rentPrice = 12000 + (Math.floor(Math.random() * 8) * 1000);
        fList.push({ id: fId, building_id: bId, flat_number: fData.flat, floor: fData.floor,
          occupancy_status: fData.tenant ? 'occupied' : 'vacant', rent_amount: rentPrice
        });
        if (fData.tenant) {
          const tId = crypto.randomUUID();
          const phone = '7989342090'; // placeholder — update per tenant later
          tList.push({ id: tId, flat_id: fId, full_name: fData.tenant, rent_amount: rentPrice, phone });
          const months = ['2026-04-05', '2026-03-05', '2026-02-05', '2026-01-05'];
          months.forEach(mDate => {
            const allPossibleModes = ['Cash', 'SBI', 'HDFC', 'Bank Transfer', 'Online', 'Check'];
            const method = allPossibleModes[Math.floor(Math.random() * allPossibleModes.length)];
            pList.push({ id: crypto.randomUUID(), tenant_id: tId, flat_id: fId,
              payment_amount: rentPrice, payment_date: mDate, payment_status: 'paid',
              payment_mode: method, payment_method: method.toLowerCase()
            });
          });
        }
      }
    }

    localStorage.setItem('local_buildings', JSON.stringify(bList));
    localStorage.setItem('local_flats', JSON.stringify(fList));
    localStorage.setItem('local_tenants', JSON.stringify(tList));
    localStorage.setItem('local_payments', JSON.stringify(pList));
    localStorage.setItem('local_expenses', JSON.stringify(eList));
    qc.invalidateQueries();
  }, []);

  // --- LOCAL STORAGE DATA HANDLING ---
  const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
  const setLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  const syncLedgerData = async () => {
    if (!window.confirm("This will save your ledger data locally in your browser. Continue?")) return;
    setIsSyncing(true);
    try {
      const bList: any[] = [];
      const fList: any[] = [];
      const tList: any[] = [];
      const pList: any[] = [];
      const eList: any[] = [];
      const currentMonth = format(new Date(), 'MMMM-yy').toUpperCase();

      for (const bData of LEDGER_DATA) {
        const bId = crypto.randomUUID();
        bList.push({ 
          id: bId, 
          name: bData.name, 
          city: 'Hyderabad', 
          address: bData.name.includes('GAYATRI') ? '367' : 
                   bData.name.includes('KY') ? '501' : 
                   bData.name.includes('SR NAGAR') ? '206' : '217'
        });

        // Add 1 random expense record per building
        eList.push({
          id: crypto.randomUUID(),
          building_id: bId,
          month: currentMonth,
          watchmen_salary: 8000 + (Math.floor(Math.random() * 4) * 500),
          electricity_bill: 1500 + (Math.floor(Math.random() * 10) * 100),
          water_bill: 500 + (Math.floor(Math.random() * 5) * 100),
          other_expenses: 200 + (Math.floor(Math.random() * 5) * 50),
          buildings: { name: bData.name }
        });

        for (const fData of bData.flats) {
          const fId = crypto.randomUUID();
          const rentPrice = 12000 + (Math.floor(Math.random() * 8) * 1000);
          fList.push({ 
            id: fId, 
            building_id: bId, 
            flat_number: fData.flat, 
            floor: fData.floor, 
            occupancy_status: fData.tenant ? 'occupied' : 'vacant',
            rent_amount: rentPrice
          });

          if (fData.tenant) {
            const tId = crypto.randomUUID();
            const phone = '9' + Math.floor(100000000 + Math.random() * 900000000);
            tList.push({ id: tId, flat_id: fId, full_name: fData.tenant, rent_amount: rentPrice, phone: phone });

            // Last 4 months of payments
            const months = ['2026-04-05', '2026-03-05', '2026-02-05', '2026-01-05'];
            months.forEach(mDate => {
              const allPossibleModes = ['Cash', 'SBI', 'HDFC', 'Bank Transfer', 'Online', 'Check'];
              const method = allPossibleModes[Math.floor(Math.random() * allPossibleModes.length)];
              pList.push({ id: crypto.randomUUID(), tenant_id: tId, flat_id: fId, payment_amount: rentPrice, payment_date: mDate, payment_status: 'paid', payment_mode: method, payment_method: method.toLowerCase() });
            });
          }
        }
      }

      setLocal('local_buildings', bList);
      setLocal('local_flats', fList);
      setLocal('local_tenants', tList);
      setLocal('local_payments', pList);
      setLocal('local_expenses', eList);

      qc.invalidateQueries();
      toast({ title: "Local Sync Successful", description: "Everything is now stored in your browser storage!" });
    } catch (err: any) {
      toast({ title: "Sync Failed", description: err.message, variant: 'destructive' });
    } finally {
      setIsSyncing(false);
    }
  };

  // Queries (Primary: Local Storage Fallback)
  const { data: buildings = [], isLoading: loadingBuildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: async () => { 
      const local = getLocal('local_buildings');
      if (local.length > 0) return local;
      const { data } = await supabase.from('buildings').select('*').order('name'); 
      return data || []; 
    },
  });

  const { data: allFlats = [] } = useQuery({
    queryKey: ['flats'],
    queryFn: async () => { 
      const local = getLocal('local_flats');
      if (local.length > 0) return local;
      const { data } = await supabase.from('flats').select('*'); 
      return data || []; 
    },
  });

  const { data: allTenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => { 
      const local = getLocal('local_tenants');
      if (local.length > 0) return local;
      const { data } = await supabase.from('tenants').select('*'); 
      return data || []; 
    },
  });

  const { data: allPayments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => { 
      const local = getLocal('local_payments');
      if (local.length > 0) return local.sort((a: any, b: any) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
      const { data } = await supabase.from('rent_payments').select('*').order('payment_date', { ascending: false });
      return data || [];
    },
  });

  // Handlers
  const handleSelectBuilding = (building: any) => {
    setSelectedBuilding(building);
    setView('flats');
  };

  const handleSelectTenant = (tenant: any) => {
    setSelectedTenant(tenant);
    setView('tenant');
  };

  const goBack = () => {
    if (view === 'tenant') setView('flats');
    else if (view === 'flats') setView('buildings');
  };

  // Rendering
  const renderBuildings = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {buildings.map((building: any, idx: number) => {
        const buildingFlats = allFlats.filter(f => f.building_id === building.id);
        const occupiedCount = buildingFlats.filter(f => f.occupancy_status === 'occupied').length;
        
        // Random fallback images for buildings without an image_url
        const fallbackImages = [
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1545324418-4121f083f24b?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1580587771525-78b9daa3b919?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1449156059521-cb214250e67b?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1470723710355-9500c580c0ef?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop'
        ];
        let displayImage = building.image_url || fallbackImages[idx % fallbackImages.length];

        const propertyPhoto = "https://lh3.googleusercontent.com/gps-cs-s/AHVAwep9Ej1-U04a7IGz3qCkuQZe5eC_QUTSFRyDqVZfcvuHcnDohv8UvmAfS70fBbGJo5yXJpxGT5CcCiJd6MubVOT41whD-p60-wT2IiJ1yg5jbs4gTgEBYlTPyWXlQm-liesS-p18sYZqqK9Q=s846-k-no";
        const srNagarPhoto = "https://cdn.confident-group.com/wp-content/uploads/2025/06/11152708/Residential-high-rises-1024x679.jpg";

        // Apply provided photo to Mustafa, Lake View, and the Last building
        const isMustafa = building.name.toLowerCase().includes('mustafa');
        const isLakeView = building.name.toLowerCase().includes('lake view');
        const isLastBuilding = idx === buildings.length - 1;
        const isKaleem = building.name.toLowerCase().includes('kaleem') || building.name.toLowerCase().includes('ky');
        const isSRNagar = building.name.toLowerCase().includes('sr nagar');

        if (isMustafa || isLakeView || isLastBuilding || isKaleem) {
          displayImage = propertyPhoto;
        }

        if (isSRNagar) {
          displayImage = srNagarPhoto;
        }

        return (
          <motion.div
            key={building.id}
            whileHover={{ y: -4 }}
            className="cursor-pointer"
            onClick={() => handleSelectBuilding(building)}
          >
            <Card className="h-full border-border/50 hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="h-48 bg-primary/5 flex items-center justify-center border-b border-border/10 overflow-hidden relative">
                <img 
                  src={displayImage} 
                  alt={building.name} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-md">
                    {buildingFlats.length} Units
                  </Badge>
                </div>
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-xl font-bold text-foreground">{building.name}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {building.city || 'Hyderabad'}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Occupancy</span>
                  <span className="font-semibold">{occupiedCount}/{buildingFlats.length}</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${buildingFlats.length > 0 ? (occupiedCount / buildingFlats.length) * 100 : 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  const renderFlats = () => {
    const buildingFlats = allFlats.filter((f: any) => f.building_id === selectedBuilding?.id);
    const floors = [...new Set(buildingFlats.map((f: any) => Number(f.floor)))].sort((a: any, b: any) => b - a);

    return (
      <div className="space-y-8">
        {floors.map((floor: number) => (
          <div key={floor} className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <span className="w-8 h-[1px] bg-border" />
              Floor {floor}
              <span className="flex-1 h-[1px] bg-border" />
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {buildingFlats
                .filter((f: any) => Number(f.floor) === floor)
                .sort((a: any, b: any) => (a.flat_number || "").localeCompare(b.flat_number || ""))
                .map((flat: any) => {
                  const tenant = allTenants.find((t: any) => t.flat_id === flat.id);
                  const isOccupied = flat.occupancy_status === 'occupied';

                  return (
                    <motion.div
                      key={flat.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isOccupied 
                          ? 'bg-primary/5 border-primary/20 hover:border-primary/40' 
                          : 'bg-muted/50 border-border/50 hover:bg-muted opacity-60'
                      }`}
                      onClick={() => isOccupied && tenant && handleSelectTenant(tenant)}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <span className="text-lg font-bold font-mono">{flat.flat_number}</span>
                        <div className={`p-2 rounded-full ${isOccupied ? 'bg-primary/10' : 'bg-muted'}`}>
                          <User className={`h-4 w-4 ${isOccupied ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        {isOccupied ? (
                          <div className="space-y-0.5">
                            <p className="text-[11px] font-medium text-foreground truncate w-24">
                              {tenant?.full_name}
                            </p>
                            <Badge variant="outline" className="text-[10px] h-4 px-1 border-primary/20 text-primary">
                               Occupied
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">Vacant</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTenantHistory = () => {
    const tenantPayments = allPayments.filter((p: any) => p.tenant_id === selectedTenant?.id);
    const flat = allFlats.find((f: any) => f.id === selectedTenant?.flat_id);
    const currentMonth = format(new Date(), 'MMMM yyyy');

    const handleWhatsAppSend = () => {
      if (!selectedTenant?.phone) {
        toast({ title: "No Phone Number", description: "This tenant doesn't have a phone number saved.", variant: 'destructive' });
        return;
      }

      const name = selectedTenant.full_name;
      const building = selectedBuilding?.name || 'the building';
      const flatNo = flat?.flat_number || 'N/A';
      const floor = flat?.floor || 'N/A';
      const amount = Number(selectedTenant.rent_amount).toLocaleString();
      
      let message = '';
      if (whatsappTemplate === 'payment_done') {
        message = `Hi ${name}, your payment of ₹${amount} for ${building}, Floor ${floor}, Flat ${flatNo} for the month of ${currentMonth} has been received. Thank you!`;
      } else if (whatsappTemplate === 'payment_reminder') {
        message = `Hi ${name}, this is a reminder for the rent payment of ₹${amount} for ${building}, Floor ${floor}, Flat ${flatNo} for the month of ${currentMonth}. Please ignore if already paid. Thank you!`;
      } else {
        message = `Hi ${name}, regarding ${building}, Flat ${flatNo}...`;
      }

      const encodedMessage = encodeURIComponent(message);
      const OWNER_WHATSAPP = '917989342090'; // Fixed number — change when ready
      const whatsappUrl = `https://wa.me/${OWNER_WHATSAPP}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    };

    return (
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border/50 bg-card/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{selectedTenant?.full_name}</CardTitle>
                  <CardDescription>{selectedTenant?.phone || 'No phone'}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Flat No</p>
                  <p className="text-sm font-mono font-medium">{flat?.flat_number || '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Rent Amount</p>
                  <p className="text-sm font-mono font-medium">₹{Number(selectedTenant?.rent_amount).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Lease Starts</p>
                  <p className="text-sm font-medium">
                    {selectedTenant?.lease_start ? format(new Date(selectedTenant.lease_start), 'MMM dd, yyyy') : '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Lease Ends</p>
                  <p className="text-sm font-medium">
                    {selectedTenant?.lease_end ? format(new Date(selectedTenant.lease_end), 'MMM dd, yyyy') : '—'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 space-y-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-2">
                  <MessageSquare className="h-3 w-3" /> WhatsApp Template
                </p>
                <div className="flex gap-2">
                  <Select value={whatsappTemplate} onValueChange={setWhatsappTemplate}>
                    <SelectTrigger className="text-xs h-9 bg-background/50 border-primary/20">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment_done">Payment Done</SelectItem>
                      <SelectItem value="payment_reminder">Remainder Payment</SelectItem>
                      <SelectItem value="other">Other Option</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    size="sm" 
                    className="h-9 px-3 bg-green-600 hover:bg-green-700 text-white rounded-md flex-shrink-0"
                    onClick={handleWhatsAppSend}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Payment History</h3>
            <Badge variant="secondary">{tenantPayments.length} Payments</Badge>
          </div>
          
          <div className="space-y-3">
            {tenantPayments.map((payment: any) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card/30 hover:bg-card/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    payment.payment_status === 'paid' ? 'bg-green-100/10 text-green-600' : 'bg-yellow-100/10 text-yellow-600'
                  }`}>
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">₹{Number(payment.payment_amount).toLocaleString()}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3" />
                      {format(new Date(payment.payment_date), 'MMMM dd, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={
                    payment.payment_status === 'paid' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                  }>

                    {payment.payment_status}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">
                    {payment.payment_method || payment.payment_mode}
                  </p>
                </div>
              </motion.div>
            ))}
            {tenantPayments.length === 0 && (
              <div className="text-center py-12 border border-dashed border-border rounded-xl">
                <p className="text-muted-foreground text-sm">No payment history found for this tenant.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {view !== 'buildings' && (
            <Button variant="outline" size="sm" onClick={goBack} className="rounded-full h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {view === 'buildings' ? 'Property Explorer' : view === 'flats' ? selectedBuilding?.name : selectedTenant?.full_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {view === 'buildings' ? 'Select a building to view its flats' : 
               view === 'flats' ? `Showing ${allFlats.filter(f => f.building_id === selectedBuilding?.id).length} units` : 
               'Tenant detailed payment history'}
            </p>
          </div>
        </div>
        
        {view === 'buildings' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={syncLedgerData} 
            disabled={isSyncing}
            className="flex items-center gap-2 border-dashed h-9 px-4 font-bold text-xs uppercase transition-all hover:bg-primary hover:text-primary-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Ledger Data'}
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={view}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
        >
          {view === 'buildings' && renderBuildings()}
          {view === 'flats' && renderFlats()}
          {view === 'tenant' && renderTenantHistory()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
