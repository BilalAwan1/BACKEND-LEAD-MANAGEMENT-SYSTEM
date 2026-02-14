import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { list, create, get, update, remove, updateStatus } from "../controllers/lead.controller.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", list);
router.post("/", create);
router.get("/:id", get);
router.put("/:id", update);
router.delete("/:id", remove);
router.patch("/:id/status", updateStatus);

export default router;

