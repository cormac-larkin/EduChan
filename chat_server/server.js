import express from "express";
import cors from "cors";
import * as http from "http";
import { Server } from "socket.io";

const PORT = 4000;
const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Listen for connection events
io.on("connection", (socket) => {
  console.log(`Connection from ${socket.id}`);

  // When a connected client emits the 'join-room' event, add them to the specified room.
  // Future messages addressed to this room will only be delivered to clients who have joined it.
  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User ID ${socket.id} joined room: ${room}`);
  });

  // When a connected client emits the 'send-message' event, emit their message to all other clients.
  // Emit the 'receive-message' event along with the message, so clients know that a new message has been delivered.
  socket.on("send-message", (message) => {
    // socket.to(message.room).emit("receive-message", message)
    socket.broadcast.emit("receive-message", message);
  });

  socket.on("delete-message", () => {
    socket.broadcast.emit("delete-message");
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`*** Server listening on http://localhost:${PORT} ***`);
});
