import express from "express";
import session from "express-session";
import fileUpload from "express-fileupload";
import "dotenv/config";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import promptRoutes from "./routes/promptRoutes.js"

const app = express();

// Allow incoming requests from React App on localhost
app.use(cors({ credentials: true, origin: "http://localhost:3000" })); 

// Allow parsing JSON data from incoming requests
app.use(express.json());

// Allow file uploads
app.use(fileUpload());

// Configuration for session cookies
app.use(
  session({
    cookie: { maxAge: 86400000 }, // Cookies expire after 24 hours
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    unset: "destroy"
  })
);

app.use("/auth", authRoutes);
app.use("/users", userRoutes)
app.use("/chats", chatRoutes);
app.use("/quizzes", quizRoutes);
app.use("/prompts", promptRoutes);

export default app;

