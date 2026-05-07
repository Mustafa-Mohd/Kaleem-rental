import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Monthly Ledger</h1>
        <span className="text-sm font-mono text-muted-foreground">{currentMonth}</span>
      </div>

      {buildings.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">No buildings yet. Add buildings from the Buildings tab.</p>
      )}

      {buildings.map((building: any) => {
        const buildingFlats = flats.filter((f: any) => f.building_id === building.id);
        const buildingExpense = expenses.find((e: any) => e.building_id === building.id && e.month === currentMonth);

        return (
          <div key={building.id} className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Building Header */}
            <div className="bg-accent px-4 py-2 flex items-center justify-between">
              <span className="font-semibold text-sm text-accent-foreground">
                {building.name}
              </span>
              <span className="text-xs text-muted-foreground">{currentMonth}</span>
            </div>

            <div className="flex flex-col lg:flex-row">
              {/* Flats Table */}
              <div className="flex-1 min-w-0 overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-3 py-1.5 font-medium text-muted-foreground w-20 whitespace-nowrap">Flat No</th>
                      <th className="text-left px-3 py-1.5 font-medium text-muted-foreground whitespace-nowrap">Tenant</th>
                      <th className="text-left px-3 py-1.5 font-medium text-muted-foreground w-20 whitespace-nowrap">Date</th>
                      <th className="text-right px-3 py-1.5 font-medium text-muted-foreground w-24 whitespace-nowrap">Amount</th>
                      <th className="text-center px-3 py-1.5 font-medium text-muted-foreground w-20 whitespace-nowrap">Mode</th>
                      <th className="text-center px-3 py-1.5 font-medium text-muted-foreground w-20 whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buildingFlats.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-4 text-muted-foreground text-xs">No flats added</td></tr>
                    )}
                    {buildingFlats.map((flat: any) => {
                      const tenant = tenants.find((t: any) => t.flat_id === flat.id);
                      const payment = payments.find(
                        (p: any) => p.flat_id === flat.id && p.payment_date?.startsWith(format(new Date(), 'yyyy-MM'))
                      );

                      return (
                        <tr key={flat.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="px-3 py-1.5 font-mono text-xs font-medium whitespace-nowrap">{flat.flat_number}</td>
                          <td className="px-3 py-1.5 text-xs whitespace-nowrap">
                            {tenant?.full_name || <span className="text-muted-foreground italic">Vacant</span>}
                          </td>
                          <td className="px-3 py-1.5 text-xs text-muted-foreground whitespace-nowrap">
                            {payment?.payment_date ? format(new Date(payment.payment_date), 'dd/MM') : '—'}
                          </td>
                          <td className="px-3 py-1.5 text-xs text-right font-mono whitespace-nowrap">
                            {payment ? `₹${Number(payment.payment_amount).toLocaleString()}` : flat.rent_amount > 0 ? `₹${Number(flat.rent_amount).toLocaleString()}` : '—'}
                          </td>
                          <td className="px-3 py-1.5 text-xs text-center whitespace-nowrap">
                            {payment?.payment_mode || payment?.payment_method || '—'}
                          </td>
                          <td className="px-3 py-1.5 text-center whitespace-nowrap">
                            {payment ? (
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                payment.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                payment.payment_status === 'late' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {payment.payment_status}
                              </span>
                            ) : tenant ? (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-700">pending</span>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Expenses Sidebar */}
              <div className="w-full lg:w-48 lg:border-l border-t lg:border-t-0 border-border bg-muted/30 text-xs flex-shrink-0">
                <div className="px-3 py-1.5 border-b border-border bg-muted/50 font-medium text-muted-foreground">Expenses</div>
                <div className="divide-y divide-border/50">
                  <div className="px-3 py-1.5 flex justify-between">
                    <span className="text-muted-foreground">Watchmen</span>
                    <span className="font-mono">{buildingExpense ? `₹${Number(buildingExpense.watchmen_salary).toLocaleString()}` : '—'}</span>
                  </div>
                  <div className="px-3 py-1.5 flex justify-between">
                    <span className="text-muted-foreground">Electricity</span>
                    <span className="font-mono">{buildingExpense ? `₹${Number(buildingExpense.electricity_bill).toLocaleString()}` : '—'}</span>
                  </div>
                  <div className="px-3 py-1.5 flex justify-between">
                    <span className="text-muted-foreground">Water</span>
                    <span className="font-mono">{buildingExpense ? `₹${Number(buildingExpense.water_bill).toLocaleString()}` : '—'}</span>
                  </div>
                  <div className="px-3 py-1.5 flex justify-between">
                    <span className="text-muted-foreground">Other</span>
                    <span className="font-mono">{buildingExpense ? `₹${Number(buildingExpense.other_expenses).toLocaleString()}` : '—'}</span>
                  </div>
                  <div className="px-3 py-1.5 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="font-mono">
                      {buildingExpense
                        ? `₹${(Number(buildingExpense.watchmen_salary) + Number(buildingExpense.electricity_bill) + Number(buildingExpense.water_bill) + Number(buildingExpense.other_expenses)).toLocaleString()}`
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
