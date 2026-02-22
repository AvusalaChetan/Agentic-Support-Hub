import { DollarSign, Package, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RefundCardProps {
  data: {
    success?: boolean;
    approved?: boolean;
    error?: string;
    data?: {
      orderId?: string;
      customerName?: string;
      items?: { name: string; quantity: number; price: number }[];
      totalAmount?: number;
      refundAmount?: number;
      status?: string;
      refundStatus?: string;
      deliveryTimestamp?: string;
      message?: string;
      minutesSinceDelivery?: number;
      minutesRemaining?: number;
    };
  } | null;
  onConfirmRefund?: (orderId: string) => void;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'delivered':
      return <Badge variant="success">Delivered</Badge>;
    case 'refunded':
      return <Badge variant="warning">Refunded</Badge>;
    case 'out_for_delivery':
      return <Badge variant="default">Out for Delivery</Badge>;
    case 'preparing':
      return <Badge variant="secondary">Preparing</Badge>;
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getRefundBadge(refundStatus: string) {
  switch (refundStatus) {
    case 'approved':
      return <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</Badge>;
    case 'denied':
      return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Denied</Badge>;
    case 'requested':
      return <Badge variant="warning" className="gap-1"><AlertTriangle className="w-3 h-3" /> Requested</Badge>;
    default:
      return null;
  }
}

export function RefundCard({ data, onConfirmRefund }: RefundCardProps) {
  if (!data) {
    return (
      <Card className="glass-panel h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-violet-400/50" />
          </div>
          <p className="text-sm text-muted-foreground">No order selected</p>
          <p className="text-xs text-muted-foreground/50 mt-1">
            Ask about an order to see its details
          </p>
        </div>
      </Card>
    );
  }

  const orderData = data.data;
  const isRefundResult = data.approved !== undefined;

  return (
    <Card className="glass-panel h-full flex flex-col animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isRefundResult
                ? data.approved
                  ? 'bg-emerald-500/15'
                  : 'bg-red-500/15'
                : 'bg-violet-500/15'
            }`}>
              {isRefundResult ? (
                data.approved ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )
              ) : (
                <Package className="w-4 h-4 text-violet-400" />
              )}
            </div>
            {isRefundResult ? 'Refund Result' : 'Order Details'}
          </CardTitle>
          <div className="flex items-center gap-2">
            {orderData?.status && getStatusBadge(orderData.status)}
            {orderData?.refundStatus && getRefundBadge(orderData.refundStatus)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Error state */}
        {data.error && (
          <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-900/60 to-red-900/60 border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-semibold text-yellow-200">Error</span>
            </div>
            <p className="text-sm text-yellow-100/90">{data.error}</p>
          </div>
        )}

        {/* Refund verdict */}
        {isRefundResult && orderData?.message && (
          <div
            className={`p-4 rounded-lg border ${
              data.approved
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}
          >
            <p className={`text-sm ${data.approved ? 'text-emerald-300' : 'text-red-300'}`}>
              {orderData.message}
            </p>
          </div>
        )}

        {/* Order info */}
        {orderData && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <InfoBlock
                icon={<Package className="w-4 h-4" />}
                label="Order ID"
                value={orderData.orderId || '—'}
              />
              <InfoBlock
                icon={<DollarSign className="w-4 h-4" />}
                label={isRefundResult && data.approved ? 'Refund Amount' : 'Total'}
                value={`$${(orderData.refundAmount || orderData.totalAmount || 0).toFixed(2)}`}
                highlight={isRefundResult && data.approved}
              />
              {orderData.deliveryTimestamp && (
                <InfoBlock
                  icon={<Clock className="w-4 h-4" />}
                  label="Delivered At"
                  value={new Date(orderData.deliveryTimestamp).toLocaleString()}
                />
              )}
              {orderData.minutesSinceDelivery !== undefined && (
                <InfoBlock
                  icon={<Clock className="w-4 h-4" />}
                  label="Time Since Delivery"
                  value={`${orderData.minutesSinceDelivery} minutes`}
                />
              )}
            </div>

            {/* Items list */}
            {orderData.items && orderData.items.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-2">Order Items</p>
                <div className="space-y-1.5">
                  {orderData.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-2.5 rounded-lg bg-secondary/30"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{item.quantity}x</span>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm refund button (only for eligible orders) */}
            {orderData.orderId &&
              orderData.status === 'delivered' &&
              orderData.refundStatus === 'none' &&
              onConfirmRefund && (
                <Button
                  onClick={() => onConfirmRefund(orderData.orderId!)}
                  variant="destructive"
                  className="w-full mt-2"
                  id="confirm-refund-btn"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Request Refund for {orderData.orderId}
                </Button>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InfoBlock({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-secondary/30">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium ${highlight ? 'text-emerald-400' : ''}`}>{value}</p>
      </div>
    </div>
  );
}
