import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Users, CreditCard, BarChart3, Plus, Home, UserPlus, Receipt, ArrowRight, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const features = [
  { icon: Building2, title: 'Building Management', desc: 'Organize all your properties in one place with detailed records.' },
  { icon: Users, title: 'Tenant Management', desc: 'Track tenant info, leases, and communication history.' },
  { icon: CreditCard, title: 'Rent Tracking', desc: 'Monitor payments, due dates, and outstanding balances.' },
  { icon: Receipt, title: 'Payment History', desc: 'Complete audit trail of every transaction.' },
  { icon: BarChart3, title: 'Property Insights', desc: 'Analytics and reports to optimize your portfolio.' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Separate admin & tenant portals with secure authentication.' },
];

const steps = [
  { icon: Plus, title: 'Add Building', desc: 'Register your property with address and details.' },
  { icon: Home, title: 'Add Flats', desc: 'Create units with floor, rent, and status info.' },
  { icon: UserPlus, title: 'Assign Tenants', desc: 'Link tenants to flats with lease details.' },
  { icon: Receipt, title: 'Track Rent', desc: 'Record payments and monitor collection status.' },
];

const plans = [
  { name: 'Starter', price: 'Free', features: ['Up to 3 buildings', '10 flats', 'Basic reports', 'Email support'] },
  { name: 'Pro', price: '$29/mo', features: ['Unlimited buildings', 'Unlimited flats', 'Advanced analytics', 'Priority support'], popular: true },
  { name: 'Enterprise', price: 'Custom', features: ['Custom integrations', 'Dedicated account manager', 'SLA guarantee', 'On-premise option'] },
];

export default function Landing() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    if (featuresRef.current) {
      gsap.fromTo(featuresRef.current.querySelectorAll('.feature-card'), { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: featuresRef.current, start: 'top 80%' } });
    }
    if (stepsRef.current) {
      gsap.fromTo(stepsRef.current.querySelectorAll('.step-card'), { x: -40, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.15, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: stepsRef.current, start: 'top 80%' } });
    }

    return () => { lenis.destroy(); ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">RentFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/signup">Start Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 hero-bg opacity-[0.03]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl mx-auto text-center">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-muted/50 text-sm text-muted-foreground mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Now in public beta
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6 text-foreground">
              Property management,{' '}
              <span className="gradient-text">simplified</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              The all-in-one platform for property owners and managers. Track buildings, tenants, and payments with a beautiful, modern dashboard.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="px-8 h-12 text-base" asChild>
                <Link to="/login">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 h-12 text-base" asChild>
                <Link to="/signup">Create Account</Link>
              </Button>
            </motion.div>
            <motion.div variants={fadeUp} custom={4} className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/50 max-w-md mx-auto">
              <p className="text-xs font-medium text-muted-foreground mb-2">Quick Access:</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card p-3 text-center">
                  <Shield className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-xs font-medium text-foreground">Admin Portal</p>
                  <p className="text-[10px] text-muted-foreground">admin@gmail.com</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <Users className="h-5 w-5 text-success mx-auto mb-1" />
                  <p className="text-xs font-medium text-foreground">Tenant Portal</p>
                  <p className="text-[10px] text-muted-foreground">Sign up free</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" ref={featuresRef} className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Everything you need to manage properties</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Powerful tools designed for property owners who demand clarity and efficiency.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <div key={i} className="feature-card glass-card p-6 hover-lift group cursor-default">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" ref={stepsRef} className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Get started in minutes</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <div key={i} className="step-card text-center">
                <div className="h-14 w-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 text-primary-foreground">
                  <s.icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">Step {i + 1}</span>
                <h3 className="font-semibold text-foreground mt-1 mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Simple, transparent pricing</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`glass-card p-8 relative ${p.popular ? 'border-primary/50 shadow-lg' : ''}`}>
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium gradient-bg text-primary-foreground">Most Popular</span>
                )}
                <h3 className="font-semibold text-foreground">{p.name}</h3>
                <p className="text-3xl font-bold text-foreground mt-2 mb-6">{p.price}</p>
                <ul className="space-y-3 mb-8">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-success shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button variant={p.popular ? 'default' : 'outline'} className="w-full" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded gradient-bg flex items-center justify-center">
                <Building2 className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">RentFlow</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <span>Privacy</span>
              <span>Terms</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 RentFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
