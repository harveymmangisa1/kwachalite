'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X, CheckCircle, Clock, AlertCircle, Camera, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/lib/data';
import type { SavingsGroup, GroupContribution } from '@/lib/types';

// Form validation schema
const contributionSchema = z.object({
  amount: z.number().min(1, "Amount must be at least 1"),
  method: z.enum(['cash', 'bank_transfer', 'mobile_money', 'other']),
  description: z.string().optional(),
});

type ContributionFormValues = z.infer<typeof contributionSchema>;

interface ContributeModalProps {
  group: SavingsGroup;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ContributeModal({ 
  group, 
  trigger, 
  isOpen: controlledOpen,
  onOpenChange: controlledOnOpenChange 
}: ContributeModalProps) {
  const { toast } = useToast();
  const { addGroupContribution, updateSavingsGroup } = useAppStore();
  
  const [isInternalOpen, setIsInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : isInternalOpen;
  const setIsOpen = isControlled ? controlledOnOpenChange! : setIsInternalOpen;

  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      amount: group.contributionRules?.minAmount || 1,
      method: 'mobile_money',
      description: '',
    },
  });

  const progressPercentage = group.targetAmount > 0 
    ? (group.currentAmount / group.targetAmount) * 100 
    : 0;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image (JPG, PNG, WebP) or PDF file.',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: 'Please upload a file smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }

      setUploadedFile(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);

  };

  const onSubmit = async (values: ContributionFormValues) => {
    if (!uploadedFile) {
      toast({
        title: 'Proof of payment required',
        description: 'Please upload a proof of payment to continue.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create contribution record
      const contribution: GroupContribution = {
        id: `contrib-${Date.now()}`,
        groupId: group.id,
        memberId: 'current-user', // TODO: Get from auth
        amount: values.amount,
        description: values.description,
        contributedAt: new Date().toISOString(),
        method: values.method,
        status: 'pending', // Requires admin confirmation
        proofFile: uploadedFile.name,
      };

      // Add contribution to store
      addGroupContribution(contribution);

      // Update group current amount (but keep as pending until confirmed)
      updateSavingsGroup({
        ...group,
        currentAmount: group.currentAmount + values.amount,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: 'Contribution submitted!',
        description: `Your contribution of ${formatCurrency(values.amount)} has been submitted for review.`,
      });

      // Reset form and close modal
      form.reset();
      removeFile();
      setIsOpen(false);

    } catch (error) {
      console.error('Contribution error:', error);
      toast({
        title: 'Error submitting contribution',
        description: 'Failed to submit your contribution. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods = [
    { value: 'mobile_money', label: 'Mobile Money', icon: '📱' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
    { value: 'cash', label: 'Cash Deposit', icon: '💵' },
    { value: 'other', label: 'Other', icon: '💳' },
  ];

  const defaultTrigger = (
    <Button className="flex-1">
      <Upload className="h-4 w-4 mr-2" />
      Contribute
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Contribute to {group.name}
          </DialogTitle>
          <DialogDescription>
            Add your contribution and upload proof of payment for verification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Group Progress Overview */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Progress</span>
                  <Badge variant={progressPercentage >= 100 ? "default" : "secondary"}>
                    {progressPercentage.toFixed(1)}%
                  </Badge>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatCurrency(group.currentAmount)}</span>
                  <span>{formatCurrency(group.targetAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contribution Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 form-scroll-container">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Contribution Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  {group.currency === 'USD' ? '$' : group.currency === 'MWK' ? 'MK' : '₵'}
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min={group.contributionRules?.minAmount || 1}
                  placeholder="0.00"
                  className="pl-8 input-transparent"
                  {...form.register('amount', { valueAsNumber: true })}
                />
              </div>
              {group.contributionRules?.minAmount && (
                <p className="text-xs text-muted-foreground">
                  Minimum contribution: {formatCurrency(group.contributionRules.minAmount)}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method</Label>
              <Select 
                value={form.watch('method')} 
                onValueChange={(value) => form.setValue('method', value as any)}
              >
                <SelectTrigger className="input-transparent">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-2">
                        <span>{method.icon}</span>
                        <span>{method.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add any notes about this contribution..."
                className="resize-none input-transparent"
                rows={3}
                {...form.register('description')}
              />
            </div>

            {/* Proof of Payment Upload */}
            <div className="space-y-3">
              <Label>Proof of Payment *</Label>
              
              {!uploadedFile ? (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="proof-upload"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label 
                    htmlFor="proof-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Camera className="h-8 w-8 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="font-medium">Upload proof of payment</p>
                      <p className="text-muted-foreground">
                        Images (JPG, PNG, WebP) or PDF • Max 5MB
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {previewUrl ? (
                        <img 
                          src={previewUrl} 
                          alt="Proof preview" 
                          className="h-16 w-16 object-cover rounded"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Status Notice */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900">
                      Pending Verification
                    </p>
                    <p className="text-xs text-blue-700">
                      Your contribution will be reviewed by the group admin before being added to the group total.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || !uploadedFile}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Contribution'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}