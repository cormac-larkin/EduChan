import express from "express";
import session from "express-session";
import "dotenv/config";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

const PORT = 5000;
const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(
  session({
    cookie: { maxAge: 86400000 }, // Cookies expire after 24 hours
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`*** Server listening on Port ${PORT} ***`);
});
