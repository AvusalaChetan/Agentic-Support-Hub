import { MapPin, Navigation, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MapWidgetProps {
  data: {
    orderId?: string;
    driverName?: string;
    driverLocation?: { lat: number; lng: number };
    deliveryAddress?: string;
    status?: string;
    message?: string;
  } | null;
}

export function MapWidget({ data }: MapWidgetProps) {
  if (!data) {
    return (
      <Card className="glass-panel h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-blue-400/50" />
          </div>
          <p className="text-sm text-muted-foreground">No active delivery to track</p>
          <p className="text-xs text-muted-foreground/50 mt-1">
            Ask about an order that's out for delivery
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-panel h-full flex flex-col animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <Navigation className="w-4 h-4 text-blue-400" />
            </div>
            Live Tracking
          </CardTitle>
          <Badge variant="success" className="gap-1">
            <span className="status-dot status-dot-active" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Simulated Map */}
        <div className="relative flex-1 min-h-[250px] rounded-xl overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/[0.06]">
          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Roads */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
            <path d="M 50 150 Q 200 100 350 150" stroke="hsl(var(--muted-foreground) / 0.2)" strokeWidth="3" fill="none" strokeDasharray="8 4" />
            <path d="M 200 20 Q 180 150 200 280" stroke="hsl(var(--muted-foreground) / 0.2)" strokeWidth="3" fill="none" strokeDasharray="8 4" />
          </svg>

          {/* Driver marker */}
          <div
            className="absolute animate-pulse"
            style={{
              left: `${((data.driverLocation?.lng ?? 77.209) % 1) * 300 + 50}px`,
              top: `${((data.driverLocation?.lat ?? 28.614) % 1) * 200 + 30}px`,
            }}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center border-2 border-primary shadow-lg shadow-primary/30">
                <Navigation className="w-5 h-5 text-primary" />
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-card/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-medium border border-white/10">
                {data.driverName || 'Driver'}
              </div>
            </div>
          </div>

          {/* Destination marker */}
          <div className="absolute bottom-8 right-12">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border-2 border-emerald-400/50">
                <MapPin className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-card/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-medium border border-white/10">
                Delivery Point
              </div>
            </div>
          </div>
        </div>

        {/* Info bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/40">
            <User className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground">Driver</p>
              <p className="text-xs font-medium">{data.driverName || 'Assigned'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/40">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground">Order</p>
              <p className="text-xs font-medium">{data.orderId || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/40">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground">ETA</p>
              <p className="text-xs font-medium">~12 min</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
