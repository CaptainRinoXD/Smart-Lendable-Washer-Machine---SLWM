import express from "express";
import walletController from "../Controllers/walletController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, walletController.getWallet);
router.post("/topup", auth, walletController.topup);
router.get("/transactions", auth, walletController.getTransactions);

export default router;