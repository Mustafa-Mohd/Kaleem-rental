import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Home as HomeIcon, Key, Users, ArrowRight, Star, Menu, X } from 'lucide-react';
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
          { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power4.out', delay: 0.2 }
        );
      }

      // Parallax Image
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          yPercent: 30,
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
              start: 'top 80%',
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
    <div className="min-h-screen bg-neutral-950 text-neutral-50 overflow-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 px-4 md:px-6 py-4 flex justify-between items-center transition-all duration-300">
        <div className="text-xl font-bold flex items-center gap-2 text-emerald-400">
          <Building2 className="w-6 h-6" /> Kaleem Rentals
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex gap-4">
          <Button variant="ghost" className="text-white hover:text-emerald-400 hover:bg-neutral-900" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button className="bg-emerald-500 text-neutral-950 hover:bg-emerald-400 font-medium" asChild>
            <Link to="/admin">Dashboard</Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-white" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-[73px] left-0 right-0 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 p-4 flex flex-col gap-4 z-40 md:hidden shadow-xl">
          <Button variant="outline" className="w-full border-neutral-700 text-neutral-200" onClick={() => setIsMobileMenuOpen(false)} asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button className="w-full bg-emerald-500 text-neutral-950 hover:bg-emerald-400" onClick={() => setIsMobileMenuOpen(false)} asChild>
            <Link to="/admin">Dashboard</Link>
          </Button>
        </div>
      )}

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div ref={imageRef} className="absolute inset-0 scale-110 bg-[url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center before:content-[''] before:absolute before:inset-0 before:bg-black/60" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <h1 ref={textRef} className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-tight overflow-hidden">
            <span ref={(el) => splitTextRef.current[0] = el} className="block text-white">Find Your</span>
            <span ref={(el) => splitTextRef.current[1] = el} className="block text-emerald-400">Perfect Home</span>
          </h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-xl md:text-2xl text-neutral-300 mb-10 max-w-2xl mx-auto font-light"
          >
            Premium apartment rentals managed efficiently. Beautiful living spaces backed by state-of-the-art property management tech.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <Button size="lg" className="rounded-full px-8 py-6 text-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold" asChild>
              <Link to="/admin">
                Explore Properties <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-neutral-950 relative border-t border-neutral-900">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center md:text-left flex flex-col md:flex-row gap-8 justify-between items-end">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold mb-4">Why Choose Us?</h2>
              <p className="text-neutral-400 text-lg max-w-xl">We combine luxury living with seamless technology to provide the best renting experience possible. Step into the future of real estate.</p>
            </div>
            <Button variant="outline" className="rounded-full border-neutral-700 text-neutral-300 hover:text-white" asChild>
              <Link to="/admin">View Dashboard</Link>
            </Button>
          </div>

          <div ref={cardsRef} className="grid md:grid-cols-3 gap-8">
            <div className="bg-neutral-900/40 p-8 rounded-3xl border border-neutral-800/50 hover:border-emerald-500/30 transition-colors backdrop-blur-sm group">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-500/20 transition-colors">
                <HomeIcon className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Prime Locations</h3>
              <p className="text-neutral-400 leading-relaxed">Carefully selected properties in the most desirable neighborhoods, offering unparalleled connectivity and lifestyle for every tenant.</p>
            </div>
            <div className="bg-neutral-900/40 p-8 rounded-3xl border border-neutral-800/50 hover:border-blue-500/30 transition-colors backdrop-blur-sm group">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-500/20 transition-colors">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Community First</h3>
              <p className="text-neutral-400 leading-relaxed">Vibrant, professionally managed communities where neighbors become friends and living is effortless. Engage and connect.</p>
            </div>
            <div className="bg-neutral-900/40 p-8 rounded-3xl border border-neutral-800/50 hover:border-purple-500/30 transition-colors backdrop-blur-sm group">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-purple-500/20 transition-colors">
                <Key className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Smart Setup</h3>
              <p className="text-neutral-400 leading-relaxed">Digital lease signing, modern rent processing, and automated smart-home integrations. Manage your flat entirely online.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonial / Story Section */}
      <section className="py-24 bg-emerald-950 text-emerald-50 rounded-[3rem] mx-4 md:mx-10 mb-20 px-6 relative overflow-hidden border border-emerald-900/50 shadow-2xl shadow-emerald-900/20">
        <div className="absolute top-0 right-0 p-32 opacity-10">
          <Building2 className="w-96 h-96" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Star className="w-12 h-12 text-emerald-400 mx-auto mb-8" />
          <h2 className="text-3xl md:text-5xl font-medium leading-tight mb-8">
            "Kaleem Rentals transformed how we manage and experience renting. The seamless integration of modern tech with luxury living spaces is exactly what we needed."
          </h2>
          <p className="text-emerald-300 font-medium tracking-widest uppercase text-sm">A Modern Renting Standard</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-neutral-900 bg-neutral-950 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="w-5 h-5 text-emerald-500" /> 
          <span className="font-bold text-white text-lg">Kaleem Rentals</span>
        </div>
        <p className="text-neutral-500 text-sm">© 2026 Kaleem Rentals. All rights reserved.</p>
      </footer>
    </div>
  );
}
