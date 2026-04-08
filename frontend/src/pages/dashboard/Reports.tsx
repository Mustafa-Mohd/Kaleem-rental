import { motion } from 'framer-motion';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import { demoMonthlyRevenue, demoOccupancyByBuilding, demoPaymentMethods, demoStats } from '@/hooks/useDemoData';

const COLORS = ['hsl(220, 80%, 56%)', 'hsl(142, 72%, 42%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)'];

export default function Reports() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Financial insights and property performance metrics.</p>
      </div>

      {/* Summary Row */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${demoMonthlyRevenue.reduce((s, m) => s + m.collected, 0).toLocaleString()}`, icon: IndianRupee, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Avg Monthly', value: `₹${Math.round(demoMonthlyRevenue.reduce((s, m) => s + m.collected, 0) / 6).toLocaleString()}`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Collection Rate', value: '79%', icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Occupancy Rate', value: `${demoStats.occupancyRate}%`, icon: PieChartIcon, color: 'text-warning', bg: 'bg-warning/10' },
        ].map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-border/50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl ${c.bg} flex items-center justify-center`}>
                  <c.icon className={`h-6 w-6 ${c.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{c.value}</p>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Revenue Trend</CardTitle>
              <CardDescription>Monthly rent collection vs pending</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={demoMonthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(220, 10%, 46%)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(220, 10%, 46%)' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, '']} contentStyle={{ borderRadius: '10px', border: '1px solid hsl(220, 14%, 91%)', fontSize: 13 }} />
                  <Area type="monotone" dataKey="collected" stroke="hsl(142, 72%, 42%)" fill="hsl(142, 72%, 42%)" fillOpacity={0.15} strokeWidth={2} name="Collected" />
                  <Area type="monotone" dataKey="pending" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%)" fillOpacity={0.15} strokeWidth={2} name="Pending" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Occupancy Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Occupancy by Building</CardTitle>
              <CardDescription>Occupied vs vacant units</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={demoOccupancyByBuilding}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 91%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(220, 10%, 46%)' }} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid hsl(220, 14%, 91%)', fontSize: 13 }} />
                  <Bar dataKey="occupied" fill="hsl(220, 80%, 56%)" radius={[4, 4, 0, 0]} name="Occupied" />
                  <Bar dataKey="vacant" fill="hsl(220, 14%, 91%)" radius={[4, 4, 0, 0]} name="Vacant" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Methods Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Payment Methods</CardTitle>
              <CardDescription>Distribution of payment types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={demoPaymentMethods} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {demoPaymentMethods.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid hsl(220, 14%, 91%)', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue per Building */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Revenue per Building</CardTitle>
              <CardDescription>Monthly rent income by property</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Sunrise Towers', revenue: 48000 },
                  { name: 'Green Valley', revenue: 25000 },
                  { name: 'Lake View', revenue: 42000 },
                  { name: 'Palm Grove', revenue: 25000 },
                ]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 91%)" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(220, 10%, 46%)' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 46%)' }} width={100} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: '10px', border: '1px solid hsl(220, 14%, 91%)', fontSize: 13 }} />
                  <Bar dataKey="revenue" fill="hsl(142, 72%, 42%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
