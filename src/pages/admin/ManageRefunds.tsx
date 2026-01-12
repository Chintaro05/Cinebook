import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  CheckSquare
} from 'lucide-react';
import { useRefundablePayments, useUpdateRefundStatus, useBulkUpdateRefundStatus, RefundablePayment } from '@/hooks/useRefunds';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ManageRefunds = () => {
  const { data: payments, isLoading } = useRefundablePayments();
  const updateStatus = useUpdateRefundStatus();
  const bulkUpdateStatus = useBulkUpdateRefundStatus();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    payment: RefundablePayment | null;
    newStatus: 'refund_processing' | 'refunded';
  }>({ open: false, payment: null, newStatus: 'refund_processing' });
  const [bulkConfirmDialog, setBulkConfirmDialog] = useState<{
    open: boolean;
    newStatus: 'refund_processing' | 'refunded';
  }>({ open: false, newStatus: 'refunded' });

  const filteredPayments = payments?.filter(p => 
    statusFilter === 'all' || p.status === statusFilter
  ) || [];

  const pendingCount = payments?.filter(p => p.status === 'refund_pending').length || 0;
  const processingCount = payments?.filter(p => p.status === 'refund_processing').length || 0;
  const completedCount = payments?.filter(p => p.status === 'refunded').length || 0;

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
    setConfirmDialog({ open: true, payment, newStatus });
  };

  const confirmStatusUpdate = () => {
    if (confirmDialog.payment) {
      updateStatus.mutate({
        paymentId: confirmDialog.payment.id,
        newStatus: confirmDialog.newStatus,
        sendEmail: true,
      });
    }
    setConfirmDialog({ open: false, payment: null, newStatus: 'refund_processing' });
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
    setBulkConfirmDialog({ open: true, newStatus: 'refunded' });
  };

  const confirmBulkUpdate = () => {
    const paymentIds = Array.from(selectedIds);
    bulkUpdateStatus.mutate(
      { paymentIds, newStatus: bulkConfirmDialog.newStatus, sendEmails: true },
      {
        onSuccess: () => {
          setSelectedIds(new Set());
        },
      }
    );
    setBulkConfirmDialog({ open: false, newStatus: 'refunded' });
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-warning/10 border-warning/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Refunds</p>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
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
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No refund requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow 
                    key={payment.id}
                    className={cn(selectedIds.has(payment.id) && "bg-primary/5")}
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
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(payment.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
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
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Confirmation Dialog */}
        <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, payment: null, newStatus: 'refund_processing' })}>
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
        <AlertDialog open={bulkConfirmDialog.open} onOpenChange={(open) => !open && setBulkConfirmDialog({ open: false, newStatus: 'refunded' })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Complete {selectedCount} Refunds?</AlertDialogTitle>
              <AlertDialogDescription>
                This will mark <strong>{selectedCount} refunds</strong> totaling <strong>${selectedAmount.toFixed(2)}</strong> as "Completed" and send confirmation emails to all customers. 
                Make sure all refunds have been processed in your payment system.
              </AlertDialogDescription>
            </AlertDialogHeader>
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
