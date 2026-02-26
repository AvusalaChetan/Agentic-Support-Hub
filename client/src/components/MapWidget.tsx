import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {GoogleMap, Marker, useJsApiLoader} from "@react-google-maps/api";
import {Clock, MapPin, Navigation, User} from "lucide-react";
import {useCallback, useState} from "react";

interface MapWidgetProps {
  data: {
    orderId?: string;
    driverName?: string;
    driverLocation?: {lat: number; lng: number};
    status?: string;
    message?: string;
  } | null;
}

export function MapWidget({data}: MapWidgetProps) {
  if (!data) {
    return (
      <Card className="glass-panel h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-blue-400/50" />
          </div>
          <p className="text-sm text-muted-foreground">
            No active delivery to track
          </p>
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
        {/* Google Map with Markers */}
        <GoogleMapWidget
          driverLocation={data.driverLocation}
          driverName={data.driverName}
        />

        {/* Info bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/40">
            <User className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground">Driver</p>
              <p className="text-xs font-medium">
                {data.driverName || "Assigned"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/40">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground">Order</p>
              <p className="text-xs font-medium">{data.orderId || "—"}</p>
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

interface GoogleMapWidgetProps {
  driverLocation?: {lat: number; lng: number};
  driverName?: string;
}

const GoogleMapWidget = ({
  driverLocation,
  driverName,
}: GoogleMapWidgetProps) => {
  if (!import.meta.env.VITE_GOOGLE_API_KEY) {
    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Google API Key not configured</p>
      </div>
    );
  }
  const containerStyle = {
    width: "100%",
    height: "350px",
    minHeight: "250px",
    borderRadius: "0.75rem",
    overflow: "hidden",
  };
  const {isLoaded, loadError} = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  });
   const [, setMap] = useState<google.maps.Map | null>(null);  // Default to New Delhi if no driver location
 
  const center = driverLocation || {lat: 28.6139, lng: 77.209};

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  return isLoaded ? (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {driverLocation && (
          <Marker
            position={driverLocation}
            label={{
              text: driverName || "Driver",
              color: "#1976d2",
              fontWeight: "bold",
              fontSize: "14px",
            }}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              scaledSize: {width: 40, height: 40} as any,
            }}
          />
        )}
      </GoogleMap>
      {loadError && (
        <div className="w-full h-64 bg-red-100 rounded-lg flex items-center justify-center">
          <p className="text-red-500">Failed to load Google Maps</p>
        </div>
      )}
    </>
  ) : (
    <></>
  );
};
