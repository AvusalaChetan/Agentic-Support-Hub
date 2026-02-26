import { ChatWindow } from "@/components/ChatWindow";
import { HistoryList } from "@/components/HistoryList";
import { MapWidget } from "@/components/MapWidget";
import { RefundCard } from "@/components/RefundCard";
import { useSocket } from "@/hooks/useSocket";
import { Cpu, Sparkles, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

type WidgetType = "refund" | "map" | "history" | null;

export function Dashboard() {
  const {
    isConnected,
    thinkingSteps,
    sendMessage,
    lastResponse,
    isProcessing,
    error,
  } = useSocket();

  const [activeWidget, setActiveWidget] = useState<WidgetType>(null);
  const [widgetData, setWidgetData] = useState<Record<string, unknown> | null>(
    null,
  );

  // Update widget when AI response contains widget info
  useEffect(() => {
    if (lastResponse?.activeWidget) {
      setActiveWidget(lastResponse.activeWidget as WidgetType);
      setWidgetData(lastResponse.widgetData as Record<string, unknown> | null);
    }
  }, [lastResponse]);

  const handleConfirmRefund = (orderId: string) => {
    sendMessage(`I want a refund for order ${orderId}`);
  };

  const renderActiveWidget = () => {
    switch (activeWidget) {
      case "map":
        return (
          <MapWidget
            data={widgetData as Parameters<typeof MapWidget>[0]["data"]}
          />
        );
      case "refund":
        return (
          <RefundCard
            data={widgetData as Parameters<typeof RefundCard>[0]["data"]}
            onConfirmRefund={handleConfirmRefund}
          />
        );
      case "history":
        return (
          <HistoryList
            data={widgetData as Parameters<typeof HistoryList>[0]["data"]}
          />
        );
      default:
        return <DefaultWidget />;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* ─── Top Bar ────────────────────────────────────────────── */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-border/50 glass-panel-strong">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">
              Agentic Support Hub
            </h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">
              AI-Powered Customer Support
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 border border-white/[0.06]">
            {isConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-medium">
                  Connected
                </span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-red-400 font-medium">
                  Disconnected
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Main Content ───────────────────────────────────────── */}
      <main className="flex-1 flex overflow-hidden">
        {/* ─── LEFT PANEL (50%) ────────────────────────────────── */}
        <div className="lg:w-[50%] sm:w-full md:w-[50%] flex flex-col border-r border-border/50">
          {/* Chat Window - upper portion */}
          <div className="flex-[3] border-b border-border/50 overflow-hidden">
            <ChatWindow
              onSendMessage={sendMessage}
              isProcessing={isProcessing}
              isConnected={isConnected}
              lastResponse={lastResponse}
              error={error}
            />
          </div>

          {/* (Thinking Log removed) */}
        </div>

        {/* ─── RIGHT PANEL (60%) — Dynamic Action Stage ─────── */}
        <div className="w-[60%] flex flex-col">
          {/* Widget tabs */}
          <div className="flex items-center gap-1 px-4 py-2.5 border-b border-border/50 bg-card/30">
            <span className="text-[10px] text-muted-foreground/50 mr-2 uppercase tracking-wider font-medium">
              Action Stage
            </span>
            <WidgetTab
              label="Order / Refund"
              active={activeWidget === "refund"}
              onClick={() => setActiveWidget("refund")}
            />
            <WidgetTab
              label="Live Map"
              active={activeWidget === "map"}
              onClick={() => setActiveWidget("map")}
            />
            <WidgetTab
              label="History"
              active={activeWidget === "history"}
              onClick={() => setActiveWidget("history")}
            />
          </div>

          {/* Active widget */}
          <div className="flex-1 p-4 overflow-y-auto scrollbar-thin">
            {renderActiveWidget()}
          </div>
        </div>
      </main>
    </div>
  );
}

function WidgetTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
        active
          ? "bg-primary/15 text-primary border border-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
      }`}
    >
      {label}
    </button>
  );
}

function DefaultWidget() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/15 to-pink-500/15 flex items-center justify-center mx-auto mb-5 border border-white/[0.06]">
          <Sparkles className="w-10 h-10 text-violet-400/60" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Dynamic Action Stage</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This area dynamically updates based on your conversation with the AI
          agent. Ask about an order, request a refund, or track a delivery to
          see widgets appear here.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <QuickAction emoji="📦" label="Check Order" hint="ORD-001" />
          <QuickAction emoji="💰" label="Refund" hint="ORD-001" />
          <QuickAction emoji="🗺️" label="Track" hint="ORD-003" />
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  emoji,
  label,
  hint,
}: {
  emoji: string;
  label: string;
  hint: string;
}) {
  return (
    <div className="p-3 rounded-xl bg-secondary/30 border border-white/[0.04] text-center">
      <span className="text-2xl">{emoji}</span>
      <p className="text-xs font-medium mt-1.5">{label}</p>
      <p className="text-[10px] text-muted-foreground">{hint}</p>
    </div>
  );
}
