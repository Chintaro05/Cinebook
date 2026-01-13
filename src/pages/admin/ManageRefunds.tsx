import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  RefreshCw, 
  Clock, 
  CheckCircle, 
  Mail,
  User,
  Film,
  Calendar,
  DollarSign,
  Loader2,
  CheckSquare,
  CreditCard,
  Wallet,
  Radio,
  Banknote,
  TrendingUp,
  ChevronDown,
  History
} from 'lucide-react';
import { useRefundablePayments, useUpdateRefundStatus, useBulkUpdateRefundStatus, RefundablePayment } from '@/hooks/useRefunds';
import { RefundHistoryTimeline } from '@/components/admin/RefundHistoryTimeline';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ManageRefunds = () => {
  const { data: payments, isLoading, refetch } = useRefundablePayments();
  const updateStatus = useUpdateRefundStatus();
  const bulkUpdateStatus = useBulkUpdateRefundStatus();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    payment: RefundablePayment | null;
    newStatus: 'refund_processing' | 'refunded';
    notes: string;
  }>({ open: false, payment: null, newStatus: 'refund_processing', notes: '' });
  const [bulkConfirmDialog, setBulkConfirmDialog] = useState<{
    open: boolean;
    newStatus: 'refund_processing' | 'refunded';
    notes: string;
  }>({ open: false, newStatus: 'refunded', notes: '' });

  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  // Real-time subscription for payments
  useEffect(() => {
    const channel = supabase
      .channel('refunds-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        (payload) => {
          console.log('Realtime payment update:', payload);
          setLastUpdate(new Date());
          refetch();
          
          if (payload.eventType === 'UPDATE') {
            const newStatus = (payload.new as any).status;
            if (newStatus === 'refund_pending') {
              toast({
                title: "New Refund Request",
                description: "A new refund request has been received",
              });
            }
          }
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const filteredPayments = payments?.filter(p => 
    statusFilter === 'all' || p.status === statusFilter
  ) || [];

  const pendingCount = payments?.filter(p => p.status === 'refund_pending').length || 0;
  const processingCount = payments?.filter(p => p.status === 'refund_processing').length || 0;
  const completedCount = payments?.filter(p => p.status === 'refunded').length || 0;

  // Calculate total amounts
  const pendingAmount = payments?.filter(p => p.status === 'refund_pending').reduce((sum, p) => sum + p.amount, 0) || 0;
  const processingAmount = payments?.filter(p => p.status === 'refund_processing').reduce((sum, p) => sum + p.amount, 0) || 0;
  const completedAmount = payments?.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0) || 0;
  const totalRefundAmount = pendingAmount + processingAmount + completedAmount;

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'credit card':
        return <CreditCard className="w-4 h-4" />;
      case 'e-wallet':
        return <Wallet className="w-4 h-4" />;
      default:
        return <Banknote className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'refund_pending':
        return <Badge variant="outline" className="bg-warning/20 text-warning border-warning"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'refund_processing':
        return <Badge variant="outline" className="bg-primary/20 text-primary border-primary"><RefreshCw className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStatusUpdate = (payment: RefundablePayment, newStatus: 'refund_processing' | 'refunded') => {
    setConfirmDialog({ open: true, payment, newStatus, notes: '' });
  };

  const confirmStatusUpdate = () => {
    if (confirmDialog.payment) {
      updateStatus.mutate({
        paymentId: confirmDialog.payment.id,
        newStatus: confirmDialog.newStatus,
        sendEmail: true,
        notes: confirmDialog.notes,
      });
    }
    setConfirmDialog({ open: false, payment: null, newStatus: 'refund_processing', notes: '' });
  };

  // Bulk selection handlers
  const selectablePayments = filteredPayments.filter(p => p.status !== 'refunded');
  const processingPayments = filteredPayments.filter(p => p.status === 'refund_processing');
  
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === selectablePayments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectablePayments.map(p => p.id)));
    }
  };

  const handleBulkComplete = () => {
    if (selectedIds.size === 0) return;
    setBulkConfirmDialog({ open: true, newStatus: 'refunded', notes: '' });
  };

  const confirmBulkUpdate = () => {
    const paymentIds = Array.from(selectedIds);
    bulkUpdateStatus.mutate(
      { 
        paymentIds, 
        newStatus: bulkConfirmDialog.newStatus, 
        sendEmails: true,
        notes: bulkConfirmDialog.notes,
      },
      {
        onSuccess: () => {
          setSelectedIds(new Set());
        },
      }
    );
    setBulkConfirmDialog({ open: false, newStatus: 'refunded', notes: '' });
  };

  const selectedCount = selectedIds.size;
  const selectedAmount = filteredPayments
    .filter(p => selectedIds.has(p.id))
    .reduce((sum, p) => sum + p.amount, 0);

  if (isLoading) {
    return (
      <AdminLayout title="Manage Refunds">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Manage Refunds">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Refunds</h1>
            <p className="text-muted-foreground">Process and track customer refund requests</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Real-time status indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border">
              <Radio className={cn(
                "w-3 h-3",
                isRealtimeConnected ? "text-green-500 animate-pulse" : "text-muted-foreground"
              )} />
              <span className="text-xs font-medium">
                {isRealtimeConnected ? 'Live' : 'Connecting...'}
              </span>
            </div>
            {lastUpdate && (
              <span className="text-xs text-muted-foreground">
                Last update: {format(lastUpdate, 'HH:mm:ss')}
              </span>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-warning/10 border-warning/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Refunds</p>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                <p className="text-sm font-medium text-warning">${pendingAmount.toFixed(2)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-primary/10 border-primary/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <RefreshCw className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-foreground">{processingCount}</p>
                <p className="text-sm font-medium text-primary">${processingAmount.toFixed(2)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-green-500/10 border-green-500/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">{completedCount}</p>
                <p className="text-sm font-medium text-green-500">${completedAmount.toFixed(2)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-accent/50 border-accent">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent">
                <TrendingUp className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Refunds</p>
                <p className="text-2xl font-bold text-foreground">{(pendingCount + processingCount + completedCount)}</p>
                <p className="text-sm font-medium text-accent-foreground">${totalRefundAmount.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filter and Bulk Actions */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Filter by status:</span>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setSelectedIds(new Set());
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Refunds</SelectItem>
                  <SelectItem value="refund_pending">Pending</SelectItem>
                  <SelectItem value="refund_processing">Processing</SelectItem>
                  <SelectItem value="refunded">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Bulk Actions */}
            {selectedCount > 0 && (
              <div className="flex items-center gap-3 p-2 bg-primary/10 rounded-lg border border-primary/30">
                <CheckSquare className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  {selectedCount} selected (${selectedAmount.toFixed(2)})
                </span>
                <Button
                  size="sm"
                  variant="cinema"
                  onClick={handleBulkComplete}
                  disabled={bulkUpdateStatus.isPending}
                  className="gap-1"
                >
                  {bulkUpdateStatus.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3 h-3" />
                  )}
                  Mark All Complete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Refunds Table */}
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectablePayments.length > 0 && selectedIds.size === selectablePayments.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Movie</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No refund requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => {
                  const isExpanded = expandedIds.has(payment.id);
                  return (
                    <>
                      <TableRow 
                        key={payment.id}
                        className={cn(
                          selectedIds.has(payment.id) && "bg-primary/5",
                          isExpanded && "border-b-0"
                        )}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(payment.id)}
                            onCheckedChange={() => toggleSelect(payment.id)}
                            disabled={payment.status === 'refunded'}
                            aria-label={`Select refund for ${payment.profile?.full_name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{payment.profile?.full_name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{payment.profile?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Film className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{payment.booking?.movie_title}</p>
                              <p className="text-xs text-muted-foreground">
                                Seats: {payment.booking?.seats?.join(', ')}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{payment.booking?.showtime_date}</p>
                              <p className="text-xs text-muted-foreground">{payment.booking?.showtime_time}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-medium text-foreground">
                            <DollarSign className="w-4 h-4" />
                            {payment.amount.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(payment.payment_method)}
                            <div>
                              <p className="text-sm font-medium">{payment.payment_method}</p>
                              {payment.card_last_four && (
                                <p className="text-xs text-muted-foreground">****{payment.card_last_four}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(payment.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleExpanded(payment.id)}
                              className="gap-1 text-muted-foreground hover:text-foreground"
                            >
                              <History className="w-3 h-3" />
                              <ChevronDown className={cn(
                                "w-3 h-3 transition-transform",
                                isExpanded && "rotate-180"
                              )} />
                            </Button>
                            {payment.status === 'refund_pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(payment, 'refund_processing')}
                                disabled={updateStatus.isPending}
                                className="gap-1"
                              >
                                <RefreshCw className="w-3 h-3" />
                                Start Processing
                              </Button>
                            )}
                            {payment.status === 'refund_processing' && (
                              <Button
                                size="sm"
                                variant="cinema"
                                onClick={() => handleStatusUpdate(payment, 'refunded')}
                                disabled={updateStatus.isPending}
                                className="gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Mark Complete
                              </Button>
                            )}
                            {payment.status === 'refunded' && (
                              <span className="text-sm text-muted-foreground">Completed</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow key={`${payment.id}-history`} className="bg-muted/30 hover:bg-muted/30">
                          <TableCell colSpan={9} className="py-4 px-8">
                            <RefundHistoryTimeline
                              paymentId={payment.id}
                              currentStatus={payment.status}
                              createdAt={payment.created_at}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Confirmation Dialog */}
        <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, payment: null, newStatus: 'refund_processing', notes: '' })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmDialog.newStatus === 'refund_processing' 
                  ? 'Start Processing Refund?' 
                  : 'Complete Refund?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmDialog.newStatus === 'refund_processing' ? (
                  <>
                    This will mark the refund as "Processing" and send an email notification to the customer at <strong>{confirmDialog.payment?.profile?.email}</strong>.
                  </>
                ) : (
                  <>
                    This will mark the refund as "Completed" and send a confirmation email to the customer at <strong>{confirmDialog.payment?.profile?.email}</strong>. 
                    Make sure the refund has been processed in your payment system.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="admin-notes" className="text-sm font-medium">
                Admin Notes (optional)
              </Label>
              <Textarea
                id="admin-notes"
                placeholder="Add notes about this refund..."
                value={confirmDialog.notes}
                onChange={(e) => setConfirmDialog(prev => ({ ...prev, notes: e.target.value }))}
                className="mt-2"
                rows={3}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmStatusUpdate} className="gap-2">
                <Mail className="w-4 h-4" />
                {confirmDialog.newStatus === 'refund_processing' ? 'Start Processing' : 'Complete & Notify'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bulk Confirmation Dialog */}
        <AlertDialog open={bulkConfirmDialog.open} onOpenChange={(open) => !open && setBulkConfirmDialog({ open: false, newStatus: 'refunded', notes: '' })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Complete {selectedCount} Refunds?</AlertDialogTitle>
              <AlertDialogDescription>
                This will mark <strong>{selectedCount} refunds</strong> totaling <strong>${selectedAmount.toFixed(2)}</strong> as "Completed" and send confirmation emails to all customers. 
                Make sure all refunds have been processed in your payment system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="bulk-admin-notes" className="text-sm font-medium">
                Admin Notes for all refunds (optional)
              </Label>
              <Textarea
                id="bulk-admin-notes"
                placeholder="Add notes for all selected refunds..."
                value={bulkConfirmDialog.notes}
                onChange={(e) => setBulkConfirmDialog(prev => ({ ...prev, notes: e.target.value }))}
                className="mt-2"
                rows={3}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmBulkUpdate} className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Complete All & Notify
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default ManageRefunds;
