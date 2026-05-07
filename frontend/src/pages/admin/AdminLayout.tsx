import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { Building2, LayoutGrid, Home, Users, CreditCard, Receipt, Search, Printer, ArrowLeft, Menu, X, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          header, nav, button:not(.print-visible), .no-print, .mobile-menu-overlay {
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
        }
      `}} />
      
      {/* Header */}
      <header className={`h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 transition-all ${scrolled ? 'shadow-sm' : ''} print:hidden`}>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden hover:bg-slate-100 rounded-full" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link to="/admin" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 hidden sm:block">RentFlow <span className="text-primary text-xs ml-1 px-1.5 py-0.5 bg-primary/10 rounded">Pro</span></span>
          </Link>
        </div>
        
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
          {nav.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="h-9 px-4 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full gap-2 transition-colors"
            >
              <Link to="/home">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden xl:inline">Exit to Site</span>
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrint}
              className="h-9 px-4 text-slate-700 bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-full gap-2 transition-all shadow-sm"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden xl:inline">Print Report</span>
            </Button>
          </div>
          <div className="w-px h-6 bg-slate-200 hidden sm:block mx-1" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative text-slate-500 hover:text-primary">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>
            <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 cursor-pointer hover:border-primary/30 transition-colors">
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden mobile-menu-overlay"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 lg:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-lg text-slate-900">RentFlow</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {nav.map(({ to, icon: Icon, label, end }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-slate-500 hover:bg-slate-50'
                        }`
                      }
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </NavLink>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 space-y-2">
                <Button variant="outline" className="w-full justify-start gap-3 h-11 rounded-xl font-bold" onClick={handlePrint}>
                  <Printer className="h-4 w-4" />
                  Print Report
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 h-11 rounded-xl font-bold text-slate-500" asChild>
                  <Link to="/home">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Site
                  </Link>
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full">
        <Outlet />
      </main>

      <footer className="py-8 border-t border-slate-200 bg-white/50 text-center print:hidden">
        <p className="text-sm text-slate-400 font-medium italic">RentFlow Management System v2.0 • Secured by Advanced Encryption</p>
      </footer>
    </div>
  );
}
