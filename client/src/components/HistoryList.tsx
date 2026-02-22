import {ClipboardList, Package, DollarSign, Clock} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";

interface OrderHistoryItem {
  orderId: string;
  items: {name: string; quantity: number; price: number}[];
  totalAmount: number;
  status: string;
  orderTimestamp: string;
  deliveryTimestamp: string | null;
  refundStatus: string;
}

interface HistoryListProps {
  data: {
    success?: boolean;
    data?: OrderHistoryItem[];
    error?: string;
  } | null;
}

function getStatusBadge(status: string) {
  const map: Record<
    string,
    {
      variant: "success" | "warning" | "destructive" | "default" | "secondary";
      label: string;
    }
  > = {
    delivered: {variant: "success", label: "Delivered"},
    refunded: {variant: "warning", label: "Refunded"},
    out_for_delivery: {variant: "default", label: "In Transit"},
    preparing: {variant: "secondary", label: "Preparing"},
    pending: {variant: "secondary", label: "Pending"},
    cancelled: {variant: "destructive", label: "Cancelled"},
  };
  const info = map[status] || {variant: "secondary" as const, label: status};
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

export function HistoryList({data}: HistoryListProps) {
  if (!data || !data.data) {
    return (
      <Card className="glass-panel h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-cyan-400/50" />
          </div>
          <p className="text-sm text-muted-foreground">No order history</p>
          <p className="text-xs text-muted-foreground/50 mt-1">
            Ask "show my past orders" to view history
          </p>
        </div>
      </Card>
    );
  }

  if (data.error) {
    return (
      <Card className="glass-panel h-full flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-sm text-red-400">⚠️ {data.error}</p>
        </div>
      </Card>
    );
  }

  const orders = Array.isArray(data.data) ? data.data : [];

  return (
    <Card className="glass-panel h-full flex flex-col animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-cyan-400" />
            </div>
            Order History
          </CardTitle>
          <Badge variant="secondary">{orders.length} orders</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto scrollbar-thin space-y-3">
        {orders.map((order, i) => (
          <div
            key={order.orderId}
            className="p-4 rounded-xl bg-secondary/30 border border-white/[0.04] hover:border-primary/20 transition-all duration-200 animate-slide-up"
            style={{animationDelay: `${i * 80}ms`}}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold">{order.orderId}</span>
              </div>
              {getStatusBadge(order.status)}
            </div>

            <div className="space-y-1.5 mb-3">
              {order.items.map((item, j) => (
                <div key={j} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-muted-foreground">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                {new Date(order.orderTimestamp).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold">
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                {order.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
