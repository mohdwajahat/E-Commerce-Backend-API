import express, { Router } from "express";

const router: Router = express.Router();

import {
	getAllReviews,
	getSingleReview,
	createReview,
	deleteReview,
	updateReview,
} from "../controllers/reviewController";

import { authenticateUser } from "../middleware/authentication";

router.route("/").post(authenticateUser, createReview).get(getAllReviews);

router
	.route("/:id")
	.get(getSingleReview)
	.delete(authenticateUser, deleteReview)
	.patch(authenticateUser, updateReview);

export default router;
