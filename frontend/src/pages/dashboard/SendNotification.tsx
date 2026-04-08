import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bell, Users, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

export default function SendNotification() {
  const [recipientId, setRecipientId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('general');
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: sentNotifications = [] } = useQuery({
    queryKey: ['sent-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('notifications').insert({
        sender_id: user!.id,
        recipient_id: recipientId,
        title, message, type,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sent-notifications'] });
      const recipient = profiles.find(p => p.user_id === recipientId);
      toast({ title: 'Notification sent', description: `Message sent to ${recipient?.full_name || recipient?.email}` });
      setRecipientId(''); setTitle(''); setMessage(''); setType('general');
    },
    onError: (err: any) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const typeOptions = [
    { value: 'general', label: 'General' },
    { value: 'rent_reminder', label: 'Rent Reminder' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'warning', label: 'Warning' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground mt-1">Send messages and reminders to tenants</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Compose */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" /> Compose Message
              </CardTitle>
              <CardDescription>Send a notification to a specific tenant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Recipient *</Label>
                <Select value={recipientId} onValueChange={setRecipientId}>
                  <SelectTrigger><SelectValue placeholder="Select tenant" /></SelectTrigger>
                  <SelectContent>
                    {profiles.filter(p => p.user_id !== user?.id).map(p => (
                      <SelectItem key={p.user_id} value={p.user_id}>
                        {p.full_name || p.email || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {typeOptions.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Rent Reminder for March" />
              </div>
              <div className="space-y-2">
                <Label>Message *</Label>
                <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your message here..." rows={4} />
              </div>
              <Button onClick={() => sendMutation.mutate()} disabled={!recipientId || !title || !message || sendMutation.isPending} className="w-full gap-2">
                <Send className="h-4 w-4" /> {sendMutation.isPending ? 'Sending...' : 'Send Notification'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sent History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-warning" /> Sent Messages
              </CardTitle>
              <CardDescription>Recent notifications you've sent</CardDescription>
            </CardHeader>
            <CardContent>
              {sentNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No messages sent yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-auto">
                  {sentNotifications.map(n => {
                    const recipient = profiles.find(p => p.user_id === n.recipient_id);
                    return (
                      <div key={n.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                {(recipient?.full_name || 'U').split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-foreground">{recipient?.full_name || recipient?.email || 'User'}</span>
                          </div>
                          <Badge variant="secondary" className="text-[10px]">{n.type.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">{format(new Date(n.created_at), 'MMM dd, h:mm a')}</span>
                          {n.is_read && <span className="text-[10px] text-success flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Read</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
