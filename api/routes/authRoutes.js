import { Router } from "express";
import { login, logout, checkAuth } from "../controllers/authControllers.js";

const router = Router();

router.get("/", checkAuth);
router.post("/login", login);
router.post("/logout", logout);

export default router;
