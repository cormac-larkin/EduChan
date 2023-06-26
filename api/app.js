import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";

const PORT = 5000;

const app = express();
app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`*** Server listening on Port ${PORT} ***`);
});
