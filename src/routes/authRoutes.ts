import express, { Router } from "express";
import { login, register, logout } from "../controllers/authController";

const router: Router = express.Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/logout").get(logout);

export default router;
