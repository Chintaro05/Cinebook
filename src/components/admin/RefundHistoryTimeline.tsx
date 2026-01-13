import { useRefundHistory, useRefundHistoryRealtime } from '@/hooks/useRefundHistory';
import { format } from 'date-fns';
import { Clock, RefreshCw, CheckCircle, AlertCircle, ArrowRight, Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

interface RefundHistoryTimelineProps {
  paymentId: string;
  currentStatus: string;
  createdAt: string;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  completed: {
    label: 'Payment Completed',
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
  },
  refund_pending: {
    label: 'Refund Requested',
    icon: Clock,
    color: 'text-warning',
    bgColor: 'bg-warning/20',
  },
  refund_processing: {
    label: 'Refund Processing',
    icon: RefreshCw,
    color: 'text-primary',
    bgColor: 'bg-primary/20',
  },
  refunded: {
    label: 'Refund Completed',
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
  },
};

export function RefundHistoryTimeline({ paymentId, currentStatus, createdAt }: RefundHistoryTimelineProps) {
  const queryClient = useQueryClient();
  const { data: history, isLoading } = useRefundHistory(paymentId);
  
  const handleUpdate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['refund-history', paymentId] });
  }, [queryClient, paymentId]);

  useRefundHistoryRealtime(paymentId, handleUpdate);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Build timeline from history
  const timelineEvents = [];

  // Always start with initial payment event
  timelineEvents.push({
    id: 'initial',
    status: 'completed',
    timestamp: createdAt,
    isInitial: true,
  });

  // Add status changes from history
  if (history && history.length > 0) {
    history.forEach((change) => {
      timelineEvents.push({
        id: change.id,
        status: change.new_status,
        oldStatus: change.old_status,
        timestamp: change.created_at,
        notes: change.notes,
        isInitial: false,
      });
    });
  } else if (currentStatus !== 'completed') {
    // If no history but status changed, add current status
    timelineEvents.push({
      id: 'current',
      status: currentStatus,
      timestamp: createdAt,
      isInitial: false,
    });
  }

  return (
    <div className="space-y-1">
      <h4 className="text-sm font-semibold text-foreground mb-3">Status History</h4>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-border" />
        
        {/* Timeline events */}
        <div className="space-y-3">
          {timelineEvents.map((event, index) => {
            const config = statusConfig[event.status] || {
              label: event.status,
              icon: AlertCircle,
              color: 'text-muted-foreground',
              bgColor: 'bg-muted',
            };
            const Icon = config.icon;
            const isLast = index === timelineEvents.length - 1;

            return (
              <div key={event.id} className="relative flex items-start gap-3 pl-0">
                {/* Icon */}
                <div
                  className={cn(
                    'relative z-10 flex items-center justify-center w-6 h-6 rounded-full',
                    config.bgColor,
                    isLast && 'ring-2 ring-offset-2 ring-offset-background ring-primary/30'
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5', config.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('text-sm font-medium', isLast ? 'text-foreground' : 'text-muted-foreground')}>
                      {config.label}
                    </span>
                    {event.oldStatus && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" />
                        from {statusConfig[event.oldStatus]?.label || event.oldStatus}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.timestamp), 'MMM d, yyyy • h:mm a')}
                  </p>
                  {event.notes && (
                    <div className="mt-1.5 flex items-start gap-1.5 text-xs bg-muted/50 px-2 py-1.5 rounded border">
                      <MessageSquare className="w-3 h-3 mt-0.5 text-muted-foreground shrink-0" />
                      <span className="text-foreground">{event.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
