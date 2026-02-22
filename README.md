# 🤖 Agentic Support & Action Hub

A full-stack AI-powered customer support dashboard built with the MERN stack (TypeScript).

## Architecture

```
├── client/          # React 19 + Vite + Tailwind CSS + Shadcn UI
│   └── src/
│       ├── components/
│       │   ├── Dashboard.tsx      # Main split-screen layout
│       │   ├── ChatWindow.tsx     # AI chat interface
│       │   ├── ThinkingLog.tsx    # Real-time AI reasoning steps
│       │   ├── MapWidget.tsx      # Driver tracking map
│       │   ├── RefundCard.tsx     # Order details & refund UI
│       │   ├── HistoryList.tsx    # Past orders list
│       │   └── ui/               # Shadcn-style base components
│       ├── hooks/useSocket.ts     # Socket.io React hook
│       └── lib/utils.ts           # Utility functions
│
├── server/          # Node.js + Express + TypeScript
│   └── src/
│       ├── models/                # MongoDB schemas
│       │   ├── Order.ts           # Orders with deliveryTimestamp
│       │   └── User.ts            # User profiles
│       ├── services/
│       │   └── grokService.ts     # Grok (GROQ SDK) + Function Calling
│       ├── socket/
│       │   └── socketHandler.ts   # Socket.io event handlers
│       ├── routes/api.ts          # REST API routes
│       ├── seed.ts                # Demo data seeder
│       └── index.ts               # Server entry point
```

## Core Feature: AI Refund Agent

The AI agent uses **Grok (GROQ SDK) with Function Calling** to:

- Look up order status (`getOrderStatus`)
- Process refunds with the **45-minute rule** (`processRefund`)
- Track delivery drivers (`trackDriver`)
- View order history (`getOrderHistory`)

**Refund Rule:** If `(CurrentTime - order.deliveryTimestamp) > 45 minutes`, the refund is approved. Otherwise, it's denied.

## Quick Start

### 1. Setup Environment

```bash
# Copy and configure environment variables
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI and GROQ API key
```

### 2. Install Dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 3. Seed Demo Data

```bash
cd server && npm run seed
```

### 4. Run Development Servers

```bash
# Terminal 1: Start server
cd server && npm run dev

# Terminal 2: Start client
cd client && npm run dev
```

### 5. Open the Dashboard

Navigate to `http://localhost:5173`

## Demo Scenarios

Try these messages in the chat:

- `"What's the status of ORD-001?"` — Shows order details
- `"I want a refund for ORD-001"` — Approved (delivered 2hrs ago)
- `"I want a refund for ORD-002"` — Denied (delivered 20min ago)
- `"Where is my driver for ORD-003?"` — Shows map tracking
- `"Show me my past orders"` — Displays order history

## Tech Stack

| Layer     | Technology                          |
| --------- | ----------------------------------- |
| Frontend  | React 19, Vite, TypeScript          |
| Styling   | Tailwind CSS|
| Backend   | Node.js 22+, Express.js, TypeScript |
| Database  | MongoDB Atlas (Mongoose)            |
| AI        | Grok (GROQ SDK)                     |
| Real-time | Socket.io                           |
