import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Home as HomeIcon, Key, Users, ArrowRight, Star, Menu, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const splitTextRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    // Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Hero GSAP animations
    const ctx = gsap.context(() => {
      // Split text animation
      if (textRef.current && splitTextRef.current.length > 0) {
        gsap.fromTo(
          splitTextRef.current,
          { y: 100, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: 'power4.out', delay: 0.2 }
        );
      }

      // Parallax Image
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // Cards stagger on scroll
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 85%',
            },
          }
        );
      }
    });

    return () => {
      lenis.destroy();
      ctx.revert();
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 overflow-x-hidden font-sans selection:bg-emerald-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-neutral-950/70 backdrop-blur-xl border-b border-neutral-800/50 px-6 py-4 flex justify-between items-center transition-all duration-500">
        <Link to="/" className="text-xl font-bold flex items-center gap-2 group">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all duration-300">
            <Building2 className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">Kaleem Rentals</span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6 mr-6">
            <a href="#features" className="text-sm font-medium text-neutral-400 hover:text-emerald-400 transition-colors">Features</a>
            <a href="#about" className="text-sm font-medium text-neutral-400 hover:text-emerald-400 transition-colors">About</a>
          </nav>
          <Button className="bg-emerald-500 text-neutral-950 hover:bg-emerald-400 font-bold px-6 rounded-full h-10 shadow-lg shadow-emerald-500/20 transition-all active:scale-95" asChild>
            <Link to="/admin">Go to Dashboard</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-white hover:bg-neutral-900 rounded-full h-10 w-10" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className="fixed top-[73px] left-0 right-0 bg-neutral-950/95 backdrop-blur-2xl border-b border-neutral-800 p-6 flex flex-col gap-4 z-40 md:hidden shadow-2xl"
          >
            <div className="flex flex-col gap-1 mb-4">
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-lg font-medium border-b border-neutral-900 flex justify-between items-center">
                Features <ChevronRight className="w-4 h-4 text-neutral-600" />
              </a>
              <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-lg font-medium border-b border-neutral-900 flex justify-between items-center">
                About <ChevronRight className="w-4 h-4 text-neutral-600" />
              </a>
            </div>
            <Button className="w-full bg-emerald-500 text-neutral-950 hover:bg-emerald-400 h-14 text-lg font-bold rounded-2xl" onClick={() => setIsMobileMenuOpen(false)} asChild>
              <Link to="/admin">Go to Dashboard</Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div ref={imageRef} className="absolute inset-0 scale-125 bg-[url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-neutral-950/80 before:via-neutral-950/40 before:to-neutral-950" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8"
          >
            <Star className="w-3 h-3 fill-emerald-400" /> Premium Property Management
          </motion.div>
          
          <h1 ref={textRef} className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 tracking-tighter leading-[0.9] overflow-hidden">
            <span ref={(el) => splitTextRef.current[0] = el} className="block text-white">Find Your</span>
            <span ref={(el) => splitTextRef.current[1] = el} className="block text-emerald-400 italic">Perfect Home</span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-lg md:text-xl text-neutral-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Experience the future of property management. Premium apartment rentals simplified for modern living in prime locations.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="group rounded-full px-10 py-8 text-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold shadow-xl shadow-emerald-500/20 active:scale-95 transition-all" asChild>
              <Link to="/admin">
                Explore Dashboard <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <button className="px-8 py-4 text-neutral-400 hover:text-white transition-colors font-medium flex items-center gap-2">
              View Showcase <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-emerald-500 to-transparent" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold">Scroll</span>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-neutral-950 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <div className="max-w-7xl mx-auto">
          <div className="mb-24 flex flex-col md:flex-row gap-12 justify-between items-end">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-7xl font-bold mb-6 tracking-tight">The Kaleem <span className="text-emerald-500">Standard.</span></h2>
              <p className="text-neutral-400 text-xl leading-relaxed">We redefine the renting experience through meticulous property selection and cutting-edge management tools designed for your comfort.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-neutral-950 bg-neutral-800 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  </div>
                ))}
              </div>
              <div className="text-sm font-medium">
                <p className="text-white">Trusted by 500+ Tenants</p>
                <div className="flex text-emerald-500">
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                </div>
              </div>
            </div>
          </div>

          <div ref={cardsRef} className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={HomeIcon} 
              title="Prime Locations" 
              description="Discover properties in high-demand areas, offering unparalleled connectivity and lifestyle benefits." 
              color="emerald"
            />
            <FeatureCard 
              icon={Users} 
              title="Tenant Focused" 
              description="Enjoy professionally managed spaces where community and comfort are our top priorities." 
              color="blue"
            />
            <FeatureCard 
              icon={Key} 
              title="Smart Living" 
              description="From digital leases to smart home features, we integrate tech into every aspect of your stay." 
              color="purple"
            />
          </div>
        </div>
      </section>
      
      {/* Testimonial / Story Section */}
      <section id="about" className="py-24 relative px-6 overflow-hidden">
        <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-3xl -z-10" />
        <div className="max-w-5xl mx-auto bg-neutral-900/40 p-12 md:p-20 rounded-[3rem] border border-neutral-800/50 shadow-3xl text-center relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-10 border border-emerald-500/20">
              <Star className="w-8 h-8 text-emerald-400 fill-emerald-400/20" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-10 text-white tracking-tight">
              "Kaleem Rentals transformed how we manage and experience renting. The seamless integration of modern tech with luxury living is exactly what we needed."
            </h2>
            <div className="flex flex-col items-center">
              <p className="text-white font-bold text-lg mb-1">Modern Renting Standard</p>
              <p className="text-emerald-500/80 font-bold tracking-[0.2em] uppercase text-xs">Innovation in Housing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-neutral-900 bg-neutral-950 flex flex-col items-center">
        <div className="max-w-7xl w-full px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-2xl font-bold flex items-center gap-3 mb-6">
              <Building2 className="w-8 h-8 text-emerald-500" /> 
              <span>Kaleem Rentals</span>
            </Link>
            <p className="text-neutral-500 text-lg max-w-sm leading-relaxed mb-8">
              Setting new benchmarks in property management and premium living experiences since 2024.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'Instagram', 'LinkedIn'].map(social => (
                <a key={social} href="#" className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-400 hover:bg-emerald-500 hover:text-neutral-950 transition-all duration-300 border border-neutral-800">
                  <span className="sr-only">{social}</span>
                  <div className="w-4 h-4 bg-current rounded-sm" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Explore</h4>
            <ul className="flex flex-col gap-4 text-neutral-400">
              <li><Link to="/admin" className="hover:text-emerald-400 transition-colors">Dashboard</Link></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Features</a></li>
              <li><a href="#about" className="hover:text-emerald-400 transition-colors">About Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Contact</h4>
            <ul className="flex flex-col gap-4 text-neutral-400">
              <li>support@kaleemrentals.com</li>
              <li>+91 98765 43210</li>
              <li>Mumbai, Maharashtra</li>
            </ul>
          </div>
        </div>
        <div className="w-full max-w-7xl px-6 pt-12 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-neutral-500 text-sm italic">© 2026 Kaleem Rentals. Crafting premium living spaces.</p>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-neutral-600">
            <a href="#" className="hover:text-neutral-400">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-400">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: { icon: any, title: string, description: string, color: string }) {
  const colorMap: any = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 group-hover:bg-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20 group-hover:bg-purple-500/20"
  };

  const glowMap: any = {
    emerald: "group-hover:border-emerald-500/30",
    blue: "group-hover:border-blue-500/30",
    purple: "group-hover:border-purple-500/30"
  };

  return (
    <div className={`bg-neutral-900/40 p-10 rounded-[2.5rem] border border-neutral-800/50 ${glowMap[color]} transition-all duration-500 backdrop-blur-sm group relative overflow-hidden`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-[0.02] -mr-16 -mt-16 rounded-full" />
      <div className={`w-16 h-16 ${colorMap[color]} rounded-2xl flex items-center justify-center mb-10 transition-all duration-500 border`}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-bold mb-6 text-white tracking-tight">{title}</h3>
      <p className="text-neutral-400 leading-relaxed text-lg font-medium">{description}</p>
      <div className="mt-8 flex items-center text-sm font-bold uppercase tracking-widest text-neutral-600 group-hover:text-white transition-colors duration-300">
        Learn More <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
