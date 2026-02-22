import {Server, Socket} from "socket.io";
import {handleChat} from "../services/grokService";

interface ConversationMessage {
  role: string;
  parts: {text: string}[];
}

const conversations: Map<string, ConversationMessage[]> = new Map();

export function setupSocketHandlers(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Initialize conversation history for this client
    conversations.set(socket.id, []);

    socket.on("chat:message", async (data: {message: string}) => {
      const {message} = data;

      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        socket.emit("chat:error", {error: "Grok API key not configured."});
        return;
      }

      // Get or create conversation history
      const history = conversations.get(socket.id) || [];

      // Emit thinking steps in real-time
      const onThinking = (step: string) => {
        socket.emit("thinking:step", {
          step,
          timestamp: new Date().toISOString(),
        });
      };

      try {
        onThinking("📨 Message received. Starting processing...");

        const result = await handleChat(message, history, onThinking);

        // Update conversation history
        history.push({role: "user", parts: [{text: message}]});
        history.push({role: "model", parts: [{text: result.text}]});
        conversations.set(socket.id, history);

        // Send the response back
        socket.emit("chat:response", {
          text: result.text,
          activeWidget: result.activeWidget,
          widgetData: result.widgetData,
          timestamp: new Date().toISOString(),
        });

        onThinking("✨ Response delivered!");
      } catch (error) {
        console.error("Chat error:", error);
        socket.emit("chat:error", {
          error:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred.",
        });
        socket.emit("thinking:step", {
          step: "❌ Error occurred during processing.",
          timestamp: new Date().toISOString(),
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      conversations.delete(socket.id);
    });
  });
}
