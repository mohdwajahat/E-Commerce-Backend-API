import express, { Router } from "express";

const router: Router = express.Router();

import {
	getSingleUser,
	getAllUsers,
	updateUser,
	updateUserPassword,
	showCurrentUser,
} from "../controllers/userController";

import {
	authenticateUser,
	authorizePermissions,
} from "../middleware/authentication";

router
	.route("/")
	.get([authenticateUser, authorizePermissions(["admin"])], getAllUsers);
router.route("/showMe").get(authenticateUser, showCurrentUser);
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword);
router.route("/:id").get(authenticateUser, getSingleUser);

export default router;
