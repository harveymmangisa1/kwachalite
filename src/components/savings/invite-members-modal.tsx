'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  MailPlus, 
  Users, 
  Send, 
  X, 
  CheckCircle, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/data';
import { emailService } from '@/lib/email-service';
import type { GroupInvitation, SavingsGroup } from '@/lib/types';

const formSchema = z.object({
  emails: z.array(z.string().email('Invalid email address')).min(1, 'At least one email is required'),
  message: z.string().max(500, 'Message too long').optional(),
});

type FormData = z.infer<typeof formSchema>;

interface InviteMembersModalProps {
  children: React.ReactNode;
  groupId: string;
  groupName: string;
  group?: SavingsGroup;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface InvitationStatus {
  email: string;
  status: 'pending' | 'sending' | 'sent' | 'error';
  error?: string;
}

export function InviteMembersModal({ 
  children, 
  groupId, 
  groupName, 
  group,
  open, 
  onOpenChange 
}: InviteMembersModalProps) {
  const { toast } = useToast();
  const { addGroupInvitation } = useAppStore();
  const [isOpen, setIsOpen] = useState(open || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitationStatuses, setInvitationStatuses] = useState<InvitationStatus[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emails: [],
      message: `You've been invited to join the savings group "${groupName}". Click the link to accept and start contributing together!`,
    },
  });

  const [emailInput, setEmailInput] = useState('');
  const [emailList, setEmailList] = useState<string[]>([]);

  const addEmail = () => {
    const email = emailInput.trim();
    if (email && !emailList.includes(email) && form.formState.isValid) {
      setEmailList([...emailList, email]);
      form.setValue('emails', [...emailList, email]);
      setEmailInput('');
    }
  };

  const removeEmail = (emailToRemove: string) => {
    const newList = emailList.filter(email => email !== emailToRemove);
    setEmailList(newList);
    form.setValue('emails', newList);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail();
    }
  };

  const generateInvitationToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const sendInvitationEmail = async (email: string, token: string, message?: string) => {
    if (!group) return false;
    
    return await emailService.sendGroupInvitation(email, {
      groupName: group.name,
      groupDescription: group.description,
      targetAmount: group.targetAmount,
      currency: group.currency || 'MWK',
      invitedBy: 'current-user', // TODO: Get from auth
      invitationToken: token,
      customMessage: message,
      expiryDays: 7,
    });
  };

  const onSubmit = async (data: FormData) => {
    if (emailList.length === 0) {
      toast({
        title: 'No emails added',
        description: 'Please add at least one email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    // Initialize invitation statuses
    const statuses: InvitationStatus[] = emailList.map(email => ({
      email,
      status: 'pending' as const,
    }));
    setInvitationStatuses(statuses);

    try {
      const invitations: GroupInvitation[] = [];
      
      // Create invitations and send emails
      for (let i = 0; i < emailList.length; i++) {
        const email = emailList[i];
        const token = generateInvitationToken();
        
        // Update status to sending
        setInvitationStatuses(prev => 
          prev.map((status, index) => 
            index === i ? { ...status, status: 'sending' } : status
          )
        );

        // Create invitation record
        const invitation: GroupInvitation = {
          id: new Date().toISOString() + i,
          groupId,
          invitedBy: 'current-user', // TODO: Get from auth
          invitedEmail: email,
          token,
          status: 'pending',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          message: data.message,
        };

        // Send email
        const emailSent = await sendInvitationEmail(email, token, data.message);
        
        if (emailSent) {
          invitations.push(invitation);
          setInvitationStatuses(prev => 
            prev.map((status, index) => 
              index === i ? { ...status, status: 'sent' } : status
            )
          );
        } else {
          setInvitationStatuses(prev => 
            prev.map((status, index) => 
              index === i ? { 
                ...status, 
                status: 'error', 
                error: 'Failed to send email' 
              } : status
            )
          );
        }
      }

      // Add successful invitations to store
      invitations.forEach(invitation => {
        addGroupInvitation(invitation);
      });

      const successCount = invitations.length;
      const totalCount = emailList.length;

      toast({
        title: 'Invitations sent',
        description: `${successCount} of ${totalCount} invitations sent successfully.`,
        variant: successCount === totalCount ? 'default' : 'destructive',
      });

      if (successCount > 0) {
        // Reset form after successful invitations
        setEmailList([]);
        form.reset();
        setInvitationStatuses([]);
        setIsOpen(false);
        onOpenChange?.(false);
      }
    } catch (error) {
      toast({
        title: 'Error sending invitations',
        description: 'Failed to send invitations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setEmailList([]);
      form.reset();
      setInvitationStatuses([]);
    }
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const getStatusIcon = (status: InvitationStatus['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3 text-muted-foreground" />;
      case 'sending':
        return <Clock className="h-3 w-3 text-blue-500 animate-spin" />;
      case 'sent':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MailPlus className="h-5 w-5" />
            Invite Members
          </DialogTitle>
          <DialogDescription>
            Invite people to join "{groupName}" via email. They'll need to create an account if they don't have one.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 form-scroll-container">
            {/* Email Input */}
            <div className="space-y-3">
              <FormLabel>Email Addresses</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email and press Enter or comma"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onBlur={addEmail}
                  className="flex-1 input-transparent"
                />
                <Button 
                  type="button" 
                  onClick={addEmail}
                  disabled={!emailInput.trim()}
                  size="sm"
                >
                  Add
                </Button>
              </div>
              
              {/* Email List */}
              {emailList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {emailList.map((email) => (
                    <Badge key={email} variant="secondary" className="flex items-center gap-1">
                      {email}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-destructive" 
                        onClick={() => removeEmail(email)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              
              <FormDescription>
                Add email addresses of people you want to invite to this group.
              </FormDescription>
            </div>

            {/* Custom Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add a personal message to the invitation..."
                      className="resize-none input-transparent"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    This message will be included in the invitation email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Invitation Status */}
            {invitationStatuses.length > 0 && (
              <div className="space-y-2">
                <FormLabel>Invitation Status</FormLabel>
                <div className="space-y-2">
                  {invitationStatuses.map((status, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {getStatusIcon(status.status)}
                      <span className="flex-1">{status.email}</span>
                      <span className="text-muted-foreground">
                        {status.status === 'pending' && 'Waiting...'}
                        {status.status === 'sending' && 'Sending...'}
                        {status.status === 'sent' && 'Invitation sent'}
                        {status.status === 'error' && status.error || 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || emailList.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Users className="h-3 w-3 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3 mr-2" />
                    Send Invitations
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}