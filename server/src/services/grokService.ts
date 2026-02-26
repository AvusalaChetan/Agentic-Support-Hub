import dotenv from "dotenv";
dotenv.config();
import Groq from "groq-sdk";
import {
  getOrderStatus,
  processRefund,
  trackDriver,
  getOrderHistory,
} from "./helpers/helpers"; // keep your existing functions

// For demo purposes, we use a fixed user ID. In production, this would come from the authenticated user context.
const userId = "USR-001";

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) throw new Error("GROQ_API_KEY not set in .env");
const groq = new Groq({apiKey});

import {
  ChatCompletionTool,
  ChatCompletionMessageParam,
} from "groq-sdk/resources/chat/completions";

const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "getOrderStatus",
      description:
        "Retrieves the current status and full details of a customer order.",
      parameters: {
        type: "object",
        properties: {
          orderId: {
            type: "string",
            description: "The unique order identifier (e.g., ORD-001)",
          },
        },
        required: ["orderId", "userId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "processRefund",
      description:
        "Processes a refund. Approved if more than 45 minutes since delivery.",
      parameters: {
        type: "object",
        properties: {
          orderId: {type: "string", description: "The order ID to refund"},
          userId: {
            type: "string",
            description: "The user ID associated with the order",
          },
          reason: {type: "string", description: "Reason for refund"},
        },
        required: ["orderId", "userId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "trackDriver",
      description: "Gets real-time driver location for an order.",
      parameters: {
        type: "object",
        properties: {
          orderId: {type: "string", description: "The order ID to track"},
          userId: {
            type: "string",
            description: "The user ID associated with the order",
          },
        },
        required: ["orderId", "userId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getOrderHistory",
      description: "Retrieves order history for a customer.",
      parameters: {
        type: "object",
        properties: {
          userId: {type: "string", description: "The user ID"},
          limit: {type: "number", description: "Max orders to return"},
        },
        required: ["orderId", "userId"],
      },
    },
  },
];

type ThinkingCallback = (step: string) => void;

async function executeFunctionCall(
  functionName: string,
  args: Record<string, unknown>,
  onThinking?: ThinkingCallback,
): Promise<unknown> {
  onThinking?.(`🔧 Calling function: ${functionName}`);

  switch (functionName) {
    case "getOrderStatus":
      onThinking?.("Looking up order details in database...");
      return await getOrderStatus(
        args.orderId as string,
        (args.userId as string) || userId,
      );
    case "processRefund":
      onThinking?.(" Evaluating refund eligibility (checking 45-min rule)...");
      return await processRefund(
        args.orderId as string,
        (args.userId as string) || userId,
        args.reason as string | undefined,
      );
    case "trackDriver":
      onThinking?.("Fetching real-time driver location...");
      return await trackDriver(
        args.orderId as string,
        (args.userId as string) || userId,
      );
    case "getOrderHistory":
      onThinking?.(" Retrieving order history...");
      return await getOrderHistory(
        (args.userId as string) || userId,
        args.orderId as string,
        args.limit as number | undefined,
      );
    default:
      return {error: `Unknown function: ${functionName}`};
  }
}

export async function handleChat(
  userMessage: string,
  conversationHistory: {role: string; parts: {text: string}[]}[],
  onThinking?: ThinkingCallback,
) {
  onThinking?.(" AI is analyzing your message...");

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are an AI customer support agent for a food delivery service called "QuickBite".
You help customers with their orders, process refunds, and track deliveries.
- Always be polite, professional, and empathetic.
- When a customer asks about an order, use getOrderStatus.
- When a customer requests a refund, use processRefund.
- When a customer wants to track delivery, use trackDriver.
- When a customer wants past orders, use getOrderHistory.
- Assume userId is "USR-001" when not provided.`,
    },
    ...conversationHistory.map((msg) => ({
      role: (msg.role === "model" ? "assistant" : "user") as
        | "user"
        | "assistant",
      content: msg.parts.map((p) => p.text).join(""),
    })),
    {role: "user", content: userMessage},
  ];

  let activeWidget: string | null = null;
  let widgetData: unknown = null;

  // Agentic loop
  while (true) {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      tools,
      tool_choice: "auto",
      max_tokens: 1024,
    });

    const choice = response.choices[0];

    // No tool calls — final response
    if (!choice.message.tool_calls || choice.message.tool_calls.length === 0) {
      onThinking?.("Generating final response...");
      return {
        text: choice.message.content || "",
        activeWidget,
        widgetData,
      };
    }

    // Add assistant message with tool calls to history
    messages.push(choice.message as ChatCompletionMessageParam);

    // Execute each tool call
    for (const toolCall of choice.message.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments);
      onThinking?.(`⚡ AI decided to call: ${toolCall.function.name}`);

      const result = await executeFunctionCall(
        toolCall.function.name,
        args,
        onThinking,
      );

      onThinking?.(`✅ ${toolCall.function.name} completed.`);

      // Track widget
      switch (toolCall.function.name) {
        case "trackDriver":
          activeWidget = "map";
          break;
        case "processRefund":
          activeWidget = "refund";
          break;
        case "getOrderHistory":
          activeWidget = "history";
          break;
        case "getOrderStatus":
          activeWidget = "refund";
          break;
      }
      widgetData = result;

      // Add tool result to messages
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }
  }
}
