import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Mail, Lock, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setLoading(false);
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
      return;
    }

    // Check role and redirect accordingly
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: roleData } = await supabase.rpc('get_user_role', { _user_id: user.id });
      setLoading(false);
      if (roleData === 'admin') {
        navigate('/admin');
      } else {
        navigate('/tenant');
      }
    } else {
      setLoading(false);
      navigate('/tenant');
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-md text-center">
          <div className="h-20 w-20 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-8">
            <Building2 className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-4">Welcome to RentFlow</h2>
          <p className="text-muted-foreground text-lg mb-8">The smart way to manage your properties and tenants.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4 text-center">
              <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Admin Portal</p>
              <p className="text-xs text-muted-foreground">Full management</p>
            </div>
            <div className="glass-card p-4 text-center">
              <Users className="h-6 w-6 text-success mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Tenant Portal</p>
              <p className="text-xs text-muted-foreground">Self-service</p>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">RentFlow</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Sign in</h1>
          <p className="text-muted-foreground mb-8">Enter your credentials to continue</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" required />
              </div>
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="font-medium text-foreground">Admin:</span> admin@gmail.com / admin@123</p>
              <p><span className="font-medium text-foreground">Tenant:</span> Sign up with any email</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
