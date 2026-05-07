import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Home, User, ChevronLeft, CreditCard, CalendarDays, MapPin, IndianRupee, Database, RefreshCw, MessageSquare, Send, ArrowRight } from 'lucide-react';
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

  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem('local_buildings') || '[]');
    if (existing.length > 0) return;

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
          const phone = '7989342090'; 
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

  const renderBuildings = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {buildings.map((building: any, idx: number) => {
        const buildingFlats = allFlats.filter(f => f.building_id === building.id);
        const occupiedCount = buildingFlats.filter(f => f.occupancy_status === 'occupied').length;
        
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -8 }}
            className="cursor-pointer group"
            onClick={() => handleSelectBuilding(building)}
          >
            <Card className="h-full border-slate-200/60 hover:border-primary/40 transition-all duration-300 bg-white shadow-sm hover:shadow-xl hover:shadow-primary/5 overflow-hidden rounded-[2rem]">
              <div className="h-56 overflow-hidden relative">
                <img 
                  src={displayImage} 
                  alt={building.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/90 backdrop-blur-md text-slate-900 border-none px-3 py-1 font-bold shadow-sm">
                    {buildingFlats.length} Units
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4">
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary" /> {building.city || 'Hyderabad'}
                  </p>
                </div>
              </div>
              <CardHeader className="p-6">
                <CardTitle className="text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors">{building.name}</CardTitle>
                <div className="flex items-center text-sm text-slate-500 mt-1 font-medium italic">
                  Premium Residential Property
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-500 font-bold uppercase tracking-tighter">Current Occupancy</span>
                  <span className="font-bold text-slate-900">{occupiedCount} <span className="text-slate-400">/ {buildingFlats.length}</span></span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${buildingFlats.length > 0 ? (occupiedCount / buildingFlats.length) * 100 : 0}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-primary/80" 
                  />
                </div>
                <div className="mt-6 flex justify-end">
                   <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
                      <ArrowRight className="h-5 w-5" />
                   </div>
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
      <div className="space-y-12">
        {floors.map((floor: number) => (
          <div key={floor} className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-black tracking-[0.2em] uppercase">Floor {floor}</div>
               <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {buildingFlats
                .filter((f: any) => Number(f.floor) === floor)
                .sort((a: any, b: any) => (a.flat_number || "").localeCompare(b.flat_number || ""))
                .map((flat: any) => {
                  const tenant = allTenants.find((t: any) => t.flat_id === flat.id);
                  const isOccupied = flat.occupancy_status === 'occupied';

                  return (
                    <motion.div
                      key={flat.id}
                      whileHover={{ y: -4 }}
                      className={`group p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer text-center relative overflow-hidden ${
                        isOccupied 
                          ? 'bg-white border-primary/20 shadow-sm hover:shadow-lg hover:border-primary/50' 
                          : 'bg-slate-50/50 border-slate-200/50 hover:border-slate-300 opacity-60'
                      }`}
                      onClick={() => isOccupied && tenant && handleSelectTenant(tenant)}
                    >
                      <div className="relative z-10 flex flex-col items-center gap-3">
                        <span className="text-2xl font-black text-slate-900 font-mono tracking-tighter">{flat.flat_number}</span>
                        <div className={`p-3 rounded-2xl transition-colors ${isOccupied ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-slate-200 text-slate-400'}`}>
                          <User className="h-5 w-5" />
                        </div>
                        {isOccupied ? (
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-900 truncate w-full px-2">
                              {tenant?.full_name}
                            </p>
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest">
                               Active
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Vacant</span>
                        )}
                      </div>
                      {isOccupied && (
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                      )}
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
      const OWNER_WHATSAPP = '917989342090'; 
      const whatsappUrl = `https://wa.me/${OWNER_WHATSAPP}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    };

    return (
      <div className="grid lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-1 space-y-8">
          <Card className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-primary to-primary/60 relative">
               <div className="absolute -bottom-10 left-8">
                  <div className="h-24 w-24 rounded-3xl bg-white p-1 shadow-lg">
                    <div className="w-full h-full bg-slate-50 rounded-2xl flex items-center justify-center text-primary border-2 border-slate-100">
                       <User className="h-10 w-10" />
                    </div>
                  </div>
               </div>
            </div>
            <CardHeader className="pt-16 px-8">
              <CardTitle className="text-2xl font-black text-slate-900">{selectedTenant?.full_name}</CardTitle>
              <CardDescription className="text-slate-500 font-bold tracking-tight">Verified Tenant • {selectedTenant?.phone || 'No phone'}</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Unit No</p>
                  <p className="text-lg font-black text-slate-900 font-mono">{flat?.flat_number || '—'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Monthly Rent</p>
                  <p className="text-lg font-black text-slate-900 font-mono">₹{Number(selectedTenant?.rent_amount).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-bold">Lease Start</span>
                    <span className="font-black text-slate-900">{selectedTenant?.lease_start ? format(new Date(selectedTenant.lease_start), 'MMM dd, yyyy') : '—'}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-bold">Lease End</span>
                    <span className="font-black text-slate-900">{selectedTenant?.lease_end ? format(new Date(selectedTenant.lease_end), 'MMM dd, yyyy') : '—'}</span>
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" /> WhatsApp Notify
                </p>
                <div className="flex gap-3">
                  <Select value={whatsappTemplate} onValueChange={setWhatsappTemplate}>
                    <SelectTrigger className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-xs">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200">
                      <SelectItem value="payment_done">Payment Done</SelectItem>
                      <SelectItem value="payment_reminder">Remainder Payment</SelectItem>
                      <SelectItem value="other">Other Option</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    size="icon" 
                    className="h-12 w-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex-shrink-0 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                    onClick={handleWhatsAppSend}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-2xl text-slate-900 tracking-tight">Ledger Records</h3>
            <Badge className="bg-slate-900 text-white border-none px-4 py-1 rounded-full font-black text-[10px] tracking-widest">{tenantPayments.length} PAYMENTS</Badge>
          </div>
          
          <div className="space-y-4">
            {tenantPayments.map((payment: any, pIdx: number) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: pIdx * 0.05 }}
                className="group flex items-center justify-between p-6 rounded-[2rem] border-2 border-slate-100 bg-white hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-6">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${
                    payment.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-slate-900 font-mono">₹{Number(payment.payment_amount).toLocaleString()}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mt-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {format(new Date(payment.payment_date), 'MMMM dd, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Badge className={`px-4 py-1 rounded-full font-black text-[10px] tracking-widest border-none ${
                    payment.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {payment.payment_status.toUpperCase()}
                  </Badge>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                    via {payment.payment_method || payment.payment_mode || 'Manual'}
                  </p>
                </div>
              </motion.div>
            ))}
            {tenantPayments.length === 0 && (
              <div className="text-center py-20 border-4 border-dashed border-slate-100 rounded-[3rem]">
                <Database className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">No payment history found for this tenant.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          {view !== 'buildings' && (
            <Button variant="outline" size="icon" onClick={goBack} className="rounded-2xl h-12 w-12 border-slate-200 hover:bg-slate-100 transition-all active:scale-90">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
              {view === 'buildings' ? 'Explorer' : view === 'flats' ? selectedBuilding?.name : 'Tenant Profile'}
            </h1>
            <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest">
              {view === 'buildings' ? 'Real-time Property Management Dashboard' : 
               view === 'flats' ? `Units Portfolio Management` : 
               'Detailed Financial Ledger'}
            </p>
          </div>
        </div>
        
        {view === 'buildings' && (
          <Button 
            variant="default" 
            size="lg" 
            onClick={syncLedgerData} 
            disabled={isSyncing}
            className="flex items-center gap-3 h-14 px-8 font-black text-xs uppercase tracking-widest transition-all hover:scale-105 rounded-2xl shadow-xl shadow-primary/20"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Data'}
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={view}
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: -20 }}
           transition={{ duration: 0.3, ease: "circOut" }}
        >
          {view === 'buildings' && renderBuildings()}
          {view === 'flats' && renderFlats()}
          {view === 'tenant' && renderTenantHistory()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
