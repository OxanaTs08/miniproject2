import { Router } from "express";
import {
  createOrderController,
  orderByIdGetController,
  orderGetController,
  orderGetAdminController,
} from "../controlers/auth.js";
import authenticateJWT from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authenticateJWT, createOrderController);

router.get("/", orderGetController);
router.get("/", orderGetAdminController);

router.get("/:id", authenticateJWT, orderByIdGetController);

export default router;
