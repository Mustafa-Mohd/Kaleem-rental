import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Building2, Calendar, CreditCard, Receipt, User, ArrowRight, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Ledger() {
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

  const { data: flats = [] } = useQuery({
    queryKey: ['flats'],
    queryFn: async () => {
      const local = getLocal('local_flats');
      if (local.length > 0) return local;
      const { data } = await supabase.from('flats').select('*, buildings(name)');
      return data || [];
    },
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const local = getLocal('local_tenants');
      if (local.length > 0) return local;
      const { data } = await supabase.from('tenants').select('*, flats(flat_number, building_id)');
      return data || [];
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const local = getLocal('local_payments');
      if (local.length > 0) return local;
      const { data } = await supabase.from('rent_payments').select('*, tenants(full_name), flats(flat_number)');
      return data || [];
    },
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const local = JSON.parse(localStorage.getItem('local_expenses') || '[]');
      if (local.length > 0) return local;
      const { data } = await supabase.from('building_expenses').select('*');
      return data || [];
    },
  });

  const currentMonth = format(new Date(), 'MMMM-yy').toUpperCase();

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Financial Ledger</h1>
          <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> Monthly Statement • {currentMonth}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl">
          <Badge variant="outline" className="bg-white text-slate-900 border-none px-4 py-2 rounded-xl font-black text-[10px] tracking-widest shadow-sm">
            AUTO-SYNC ON
          </Badge>
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
        </div>
      </div>

      {buildings.length === 0 && (
        <div className="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
           <Building2 className="h-16 w-16 text-slate-200 mx-auto mb-4" />
           <p className="text-slate-400 font-bold">No property data found. Please add buildings to start tracking.</p>
        </div>
      )}

      <div className="space-y-12">
        {buildings.map((building: any, bIdx: number) => {
          const buildingFlats = flats.filter((f: any) => f.building_id === building.id);
          const buildingExpense = expenses.find((e: any) => e.building_id === building.id && e.month === currentMonth);
          const totalExpenses = buildingExpense 
            ? Number(buildingExpense.watchmen_salary) + Number(buildingExpense.electricity_bill) + Number(buildingExpense.water_bill) + Number(buildingExpense.other_expenses)
            : 0;
          
          const totalIncome = buildingFlats.reduce((acc: number, f: any) => {
            const payment = payments.find((p: any) => p.flat_id === f.id && p.payment_date?.startsWith(format(new Date(), 'yyyy-MM')));
            return acc + (payment ? Number(payment.payment_amount) : 0);
          }, 0);

          return (
            <motion.div 
              key={building.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: bIdx * 0.1 }}
              className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden"
            >
              {/* Building Header */}
              <div className="bg-slate-900 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight">{building.name}</h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{building.city || 'HYDERABAD'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                   <div className="text-right">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Monthly Income</p>
                      <p className="text-xl font-black text-white font-mono">₹{totalIncome.toLocaleString()}</p>
                   </div>
                   <div className="w-px h-10 bg-white/10 hidden sm:block" />
                   <div className="text-right">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Expenses</p>
                      <p className="text-xl font-black text-rose-400 font-mono">₹{totalExpenses.toLocaleString()}</p>
                   </div>
                </div>
              </div>

              <div className="flex flex-col xl:flex-row">
                {/* Flats Table */}
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tenant</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Mode</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {buildingFlats.length === 0 && (
                        <tr><td colSpan={6} className="text-center py-12 text-slate-400 font-bold">No units registered for this property</td></tr>
                      )}
                      {buildingFlats.map((flat: any) => {
                        const tenant = tenants.find((t: any) => t.flat_id === flat.id);
                        const payment = payments.find(
                          (p: any) => p.flat_id === flat.id && p.payment_date?.startsWith(format(new Date(), 'yyyy-MM'))
                        );

                        return (
                          <tr key={flat.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-5 font-black text-slate-900 font-mono text-sm">{flat.flat_number}</td>
                            <td className="px-6 py-5">
                              {tenant ? (
                                <div className="flex items-center gap-2">
                                   <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                      <User className="h-3 w-3" />
                                   </div>
                                   <span className="text-sm font-bold text-slate-700">{tenant.full_name}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-300 font-black uppercase tracking-tighter italic">Vacant Unit</span>
                              )}
                            </td>
                            <td className="px-6 py-5 text-xs font-bold text-slate-500">
                              {payment?.payment_date ? format(new Date(payment.payment_date), 'MMM dd') : '—'}
                            </td>
                            <td className="px-6 py-5 text-right font-black text-slate-900 font-mono text-sm">
                              {payment ? `₹${Number(payment.payment_amount).toLocaleString()}` : flat.rent_amount > 0 ? `₹${Number(flat.rent_amount).toLocaleString()}` : '—'}
                            </td>
                            <td className="px-6 py-5 text-center">
                               <Badge variant="outline" className="bg-slate-100 border-none text-[9px] font-black uppercase tracking-tighter text-slate-500">
                                 {payment?.payment_mode || payment?.payment_method || '—'}
                               </Badge>
                            </td>
                            <td className="px-8 py-5 text-center">
                              {payment ? (
                                <Badge className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border-none ${
                                  payment.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                  payment.payment_status === 'late' ? 'bg-rose-100 text-rose-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {payment.payment_status}
                                </Badge>
                              ) : tenant ? (
                                <Badge className="px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 border-none">pending</Badge>
                              ) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Expenses Sidebar */}
                <div className="w-full xl:w-72 bg-slate-50 p-8 border-t xl:border-t-0 xl:border-l border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-primary" /> Building Expenses
                     </h3>
                  </div>
                  <div className="space-y-4">
                    <ExpenseRow label="Watchman" amount={buildingExpense?.watchmen_salary} />
                    <ExpenseRow label="Electricity" amount={buildingExpense?.electricity_bill} />
                    <ExpenseRow label="Water" amount={buildingExpense?.water_bill} />
                    <ExpenseRow label="Maintenance" amount={buildingExpense?.other_expenses} />
                    
                    <div className="pt-6 mt-6 border-t border-slate-200">
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Total Outflow</span>
                          <span className="text-lg font-black text-rose-600 font-mono">₹{totalExpenses.toLocaleString()}</span>
                       </div>
                    </div>

                    <div className="pt-8">
                       <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Profit</span>
                             <TrendingUp className="h-3 w-3 text-emerald-500" />
                          </div>
                          <p className="text-2xl font-black text-emerald-600 font-mono">₹{(totalIncome - totalExpenses).toLocaleString()}</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ExpenseRow({ label, amount }: { label: string, amount: any }) {
  return (
    <div className="flex justify-between items-center group">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <span className="text-sm font-black text-slate-900 font-mono group-hover:text-primary transition-colors">
        {amount ? `₹${Number(amount).toLocaleString()}` : '—'}
      </span>
    </div>
  );
}
