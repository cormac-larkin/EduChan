import express from "express";
import session from "express-session";
import "dotenv/config";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

// Allow incoming requests from React App on localhost
app.use(cors({ credentials: true, origin: "http://localhost:3000" })); 

// Allows parsing JSON data from incoming requests
app.use(express.json());

// Configuration for session cookies
app.use(
  session({
    cookie: { maxAge: 86400000 }, // Cookies expire after 24 hours
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/auth", authRoutes);
app.use("/users", userRoutes)
app.use("/chats", chatRoutes);

export default app;

