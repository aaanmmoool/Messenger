import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://192.168.29.44:5173",
  "http://192.168.29.44:5174",
  "http://192.168.29.44:5175"
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  },
});

// used to store online users
export const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    // Convert userId to string to ensure consistent comparison
    const userIdStr = userId.toString();
    userSocketMap[userIdStr] = socket.id;
    console.log("User socket mapping:", { userId: userIdStr, socketId: socket.id });
    console.log("Current socket mappings:", userSocketMap);
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userId) {
      const userIdStr = userId.toString();
      delete userSocketMap[userIdStr];
      console.log("Updated socket mappings after disconnect:", userSocketMap);
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export function getReceiverSocketId(userId) {
  // Convert userId to string to ensure consistent comparison
  const userIdStr = userId.toString();
  const socketId = userSocketMap[userIdStr];
  console.log("Getting socket ID for user:", { userId: userIdStr, socketId });
  return socketId;
}

export { io, app, server };