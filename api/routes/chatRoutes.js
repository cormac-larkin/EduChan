import { Router } from "express";
import verifyTeacherRole from "../middleware/verifyTeacherRole.js";
import { getOwnedRooms, createRoom, deleteRoom } from "../controllers/chatControllers.js";

const router = Router();

router.get("/", verifyTeacherRole, getOwnedRooms); // Returns the list of active rooms a Teacher has created
router.post("/create", verifyTeacherRole, createRoom);
router.delete("/delete/:id", verifyTeacherRole, deleteRoom);


export default router;