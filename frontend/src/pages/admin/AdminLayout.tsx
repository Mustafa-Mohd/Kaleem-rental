import { Outlet, NavLink, Link } from 'react-router-dom';
import { Building2, LayoutGrid, Home, Users, CreditCard, Receipt, Search, Printer, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const nav = [
  { to: '/admin', icon: Search, label: 'Explorer', end: true },
  { to: '/admin/ledger', icon: LayoutGrid, label: 'Ledger' },
  { to: '/admin/buildings', icon: Building2, label: 'Buildings' },
  { to: '/admin/flats', icon: Home, label: 'Flats' },
  { to: '/admin/tenants', icon: Users, label: 'Tenants' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/expenses', icon: Receipt, label: 'Expenses' },
];

export default function AdminLayout() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          header, nav, button:not(.print-visible), .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
          }
          body {
            background-color: white !important;
          }
          .bg-card, .bg-muted {
            background-color: white !important;
            border-color: #eee !important;
          }
          .text-muted-foreground {
            color: #666 !important;
          }
        }
      `}} />
      <header className="h-12 border-b border-border bg-card flex items-center px-4 gap-6 sticky top-0 z-30 print:hidden">
        <span className="font-semibold text-sm tracking-wide text-foreground">RentFlow</span>
        <nav className="flex items-center gap-1 ml-4 flex-1">
          {nav.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            className="h-8 text-[10px] uppercase font-bold tracking-widest gap-2"
          >
            <Link to="/home">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Home
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            className="h-8 text-[10px] uppercase font-bold tracking-widest gap-2 bg-muted/50"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Ledger
          </Button>
        </div>
      </header>
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
