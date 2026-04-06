import { motion } from 'framer-motion';
import { Bell, BellDot, CheckCircle2, AlertCircle, Info, Wrench } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function TenantNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['my-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      for (const n of unread) {
        await supabase.from('notifications').update({ is_read: true }).eq('id', n.id);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-notifications'] }),
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const typeIcon = (type: string) => {
    switch (type) {
      case 'rent_reminder': return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'maintenance': return <Wrench className="h-5 w-5 text-primary" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'announcement': return <Info className="h-5 w-5 text-primary" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">{unreadCount} new</Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">Messages from your landlord</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()}>
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-12 text-center">
            <Bell className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No notifications yet</h3>
            <p className="text-muted-foreground">You'll see messages from your landlord here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={`border-border/50 transition-colors ${!n.is_read ? 'border-l-4 border-l-primary bg-primary/[0.02]' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="mt-0.5">{typeIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-semibold text-foreground ${!n.is_read ? '' : 'font-medium'}`}>{n.title}</p>
                          <Badge variant="secondary" className="text-[10px] mt-1">{n.type.replace('_', ' ')}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {format(new Date(n.created_at), 'MMM dd, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{n.message}</p>
                      {!n.is_read && (
                        <Button variant="ghost" size="sm" className="mt-2 text-xs gap-1 text-primary" onClick={() => markReadMutation.mutate(n.id)}>
                          <CheckCircle2 className="h-3 w-3" /> Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
