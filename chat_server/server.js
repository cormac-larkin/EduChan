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

let connectedSocketIDs = []; // Store the unique ID of each connected client socket

// Listen for connection events
io.on("connection", (socket) => {
  console.log(`Connection from ${socket.id}`);
  connectedSocketIDs.push(socket.id);
  io.sockets.emit("update-participants", connectedSocketIDs); // Each time theres a connection, broadcast the total number of connected sockets

  // When a connected client emits the 'join-room' event, add them to the specified room.
  // Future messages/events addressed to this room will only be delivered to clients who have joined it.
  socket.on("join-room", (roomTitle) => {
    // Leave any previously joined rooms
    const currentRoom = Object.keys(socket.rooms)[1];
    if (currentRoom) {
      socket.leave(currentRoom);
      console.log(`User left room: ${currentRoom}`);
    }

    // Join the specified room
    socket.join(roomTitle);
    console.log(`User ID ${socket.id} joined room: '${roomTitle}'`);
  });

  // When a connected client emits the 'send-message' event, emit their message to all other clients.
  // Emit the 'receive-message' event along with the message, so clients know that a new message has been delivered.
  socket.on("send-message", (roomTitle) => {
    socket.to(roomTitle).emit("receive-message");
  });

  socket.on("delete-message", (roomTitle) => {
    socket.to(roomTitle).emit("delete-message");
  });

  // End quizzes
  socket.on("end-quiz", (roomTitle) => {
    socket.to(roomTitle).emit("end-quiz");
  });

  // Sending prompt responses
  socket.on("prompt-response", (roomTitle) => {
    socket.to(roomTitle).emit("prompt-response");
  });

  socket.on("disconnect", () => {
    connectedSocketIDs = connectedSocketIDs.filter(
      (socketID) => socketID !== socket.id
    );
    io.sockets.emit("update-participants", connectedSocketIDs);
    console.log("User Disconnected", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`*** Server listening on http://localhost:${PORT} ***`);
});
