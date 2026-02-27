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
import {warn} from "./utils/warn";

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8080;
const CLIENT_URL: string = process.env.CLIENT_URL || "http://localhost:5173";
const GROQ_API_KEY: string | undefined = process.env.GROQ_API_KEY;
const MONGODB_URI: string | undefined = process.env.MONGODB_URI;

warn(CLIENT_URL, GROQ_API_KEY, MONGODB_URI);

// ─── Middleware ──────────────────────────────────────────────────────
app.use(
  cors({
    origin: [CLIENT_URL, "https://agentic-support-hub.zeabur.app"],
    credentials: true,
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({message: "Agentic Support Hub API is running."});
});

// ─── Routes ─────────────────────────────────────────────────────────
app.use("/api", apiRoutes);

// ─── Socket.io Setup ────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, "https://agentic-support-hub.zeabur.app"],
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
      console.warn("Set MONGODB_URI in .env to enable database features.");
    } else {
      mongoose
        .connect(mongoUri)
        .then(async () => {
          console.log("Connected to MongoDB");
          await seedData().catch((err) => {
            console.error("Seed data error:", err);
          });
          console.log(" Done!");
        })
        .catch((err) => {
          console.error("MongoDB connection error:", err);
          process.exit(1);
        });
    }

    server.listen(PORT, () => {
      console.log(`Agentic Support Hub - Server Running   `);
    });
  } catch (error) {
    console.error(" Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
