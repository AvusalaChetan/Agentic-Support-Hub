import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import {Server} from "socket.io";
import mongoose from "mongoose";
import apiRoutes from "./routes/api";
import {setupSocketHandlers} from "./socket/socketHandler";
import {seedData} from "./seed";

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8080;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
if(!CLIENT_URL) console.warn("CLIENT_URL not set. Defaulting to http://localhost:5173. Set CLIENT_URL in .env to change this.");
if(!process.env.GROQ_API_KEY) console.warn("GROQ_API_KEY not set. Grok API calls will fail. Set GROQ_API_KEY in .env to enable Grok features.");
if(!process.env.MONGODB_URI) console.warn("MONGODB_URI not set. Database features will be disabled. Set MONGODB_URI in .env to enable database connection.");

// ─── Middleware ──────────────────────────────────────────────────────
app.use(cors({origin: CLIENT_URL, credentials: true}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Agentic Support Hub API!");
});

// ─── Routes ─────────────────────────────────────────────────────────
app.use("/api", apiRoutes);

// ─── Socket.io Setup ────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

setupSocketHandlers(io);

// ─── MongoDB Connection & Server Start ──────────────────────────────
async function startServer() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.warn("MONGODB_URI not set. Running without database connection.");
      console.warn("  Set MONGODB_URI in .env to enable database features.");
    } else {
      mongoose.connect(mongoUri).then(async () => {
        console.log("Connected to MongoDB");
        await seedData();
        console.log(" Done!");
      });
    }

    server.listen(PORT, () => {
      //       console.log(`
      // ╔══════════════════════════════════════════════╗
      // ║    Agentic Support Hub - Server Running   ║
      // ╠══════════════════════════════════════════════╣
      // ║   HTTP:   http://localhost:${PORT}           ║
      // ║   Socket: ws://localhost:${PORT}             ║
      // ║   Client: ${CLIENT_URL}                      ║
      // ╚══════════════════════════════════════════════╝
      //       `);
      console.log(`Agentic Support Hub - Server Running   `);
    });
  } catch (error) {
    console.error(" Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
