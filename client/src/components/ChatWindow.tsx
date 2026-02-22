import {useState, useRef, useEffect} from "react";
import {Send, Bot, User, Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: string;
}

interface ChatWindowProps {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  isConnected: boolean;
  lastResponse: {text: string; timestamp: string} | null;
  error: string | null;
}

export function ChatWindow({
  onSendMessage,
  isProcessing,
  isConnected,
  lastResponse,
  error,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      text: ` Hi there! I'm your QuickBite AI support agent. I can help you with:\n\n
        \nHow can I help you today? `,

      timestamp: new Date().toISOString(),
    },
  ]);
  const [selectIP] = useState([
    '**Check order status** — "What\'s the status of ORD-001?"\n',
    '**Process refunds** — "I want a refund for ORD-001"\n',
    '**Track delivery** — "Where is my driver for ORD-003?"\n',
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
  }, [messages]);

  // Handle new AI responses
  useEffect(() => {
    if (lastResponse) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "ai",
          text: lastResponse.text,
          timestamp: lastResponse.timestamp,
        },
      ]);
    }
  }, [lastResponse]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isProcessing) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: trimmed,
        timestamp: new Date().toISOString(),
      },
    ]);

    onSendMessage(trimmed);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
        <div className="relative">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
              isConnected ? "bg-emerald-400" : "bg-red-400"
            }`}
          />
        </div>
        <div>
          <h2 className="text-sm font-semibold">QuickBite AI Agent</h2>
          <p className="text-xs text-muted-foreground">
            {isConnected ? "Online — Ready to help" : "Offline — Connecting..."}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-slide-up ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                msg.role === "user"
                  ? "bg-primary/30"
                  : "bg-gradient-to-br from-violet-500/30 to-pink-500/30"
              }`}
            >
              {msg.role === "user" ? (
                <User className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Bot className="w-3.5 h-3.5 text-violet-300" />
              )}
            </div>
            <div
              className={`max-w-[85%] ${
                msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.text}
              </p>
              <p className="text-[10px] text-muted-foreground/50 mt-2">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-3 mt-4">
            {selectIP.map((item, index) => (
              <button
                key={index}
                onClick={() =>
                  setInput(item.replace(/^[^—]+—\s*"|"$/g, "").trim())
                }
                className="
          px-4 py-3 text-sm text-left font-medium transition-all duration-200
          border-2 border-dashed border-primary/30 bg-primary/5 
          hover:bg-primary/10 hover:border-primary/50 hover:shadow-md
          rounded-xl whitespace-pre-wrap"
                style={{minWidth: "220px"}}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {/* Typing indicator */}
        {isProcessing && (
          <div className="flex gap-3 animate-slide-up">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/30 to-pink-500/30 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-violet-300" />
            </div>
            <div className="chat-bubble-ai flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mx-auto max-w-sm p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-red-400 animate-slide-up">
            {error.includes("tool call validation failed") ||
            error.includes("invalid_request_error")
              ? "Sorry, I couldn’t retrieve your order history. Please check your request or try again later."
              : error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isConnected
                ? "Ask about your order..."
                : "Connecting to server..."
            }
            disabled={!isConnected || isProcessing}
            className="bg-secondary/50 border-white/[0.06] focus:border-primary/40"
            id="chat-input"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing || !isConnected}
            size="icon"
            className="shrink-0"
            id="send-button"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2 px-1">
          <span className="text-[10px] text-muted-foreground/40">
            Try: "What's the status of ORD-001?" or "I want a refund for
            ORD-001"
          </span>
        </div>
      </div>
    </div>
  );
}
