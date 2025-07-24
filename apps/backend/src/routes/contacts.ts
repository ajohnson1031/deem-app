import { Router } from "express";
import { getContacts } from "../controllers/contacts.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, getContacts);

export default router;
