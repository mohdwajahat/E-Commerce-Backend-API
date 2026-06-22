import express, { Router } from "express";

const router: Router = express.Router();

import {
	updateOrder,
	createOrder,
	getAllOrders,
	getCurrentUserOrders,
	getSingleOrder,
} from "../controllers/orderController";

import {
	authenticateUser,
	authorizePermissions,
} from "../middleware/authentication";

router
	.route("/")
	.get([authenticateUser, authorizePermissions(["admin"])], getAllOrders)
	.post(authenticateUser, createOrder);

router.route("/showAllMyOrders").get(authenticateUser, getCurrentUserOrders);

router
	.route("/:id")
	.patch(authenticateUser, updateOrder)
	.get(authenticateUser, getSingleOrder);

export default router;
