import { Router } from "express";
import { getContactsHandler } from "../controllers/contacts.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, getContactsHandler);

export default router;
