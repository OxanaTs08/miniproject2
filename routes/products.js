import { Router } from "express";
import {
  createProductController,
  productGetController,
  productByIdGetController,
} from "../controlers/auth.js";

const router = Router();

router.post("/", createProductController);

router.get("/", productGetController);

router.get("/:id", productByIdGetController);

export default router;
