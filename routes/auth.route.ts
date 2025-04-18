import express from "express";
import AuthController from "../controllers/auth.controller";
import { UserController } from "../controllers/user.controller";

const router = express.Router();

const authController = new AuthController();
const userController = new UserController();

router.route("/register").post(authController.register.bind(authController)); //@ts-ignore
router.route("/stats").get(userController.getUserDetails.bind(userController));

export default router;
