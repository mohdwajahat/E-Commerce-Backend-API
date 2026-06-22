import express, { Router } from "express";

import {
	authenticateUser,
	authorizePermissions,
} from "../middleware/authentication";

const router: Router = express.Router();

import {
	createProduct,
	getAllProducts,
	getSingleProduct,
	deleteProduct,
	updateProduct,
	uploadImage,
} from "../controllers/productController";

import { getProductReviews } from "../controllers/reviewController";

router
	.route("/")
	.get(getAllProducts)
	.post([authenticateUser, authorizePermissions(["admin"])], createProduct);

router
	.route("/:id")
	.get(getSingleProduct)
	.delete([authenticateUser, authorizePermissions(["admin"])], deleteProduct)
	.patch([authenticateUser, authorizePermissions(["admin"])], updateProduct);

router
	.route("/uploadImage")
	.post([authenticateUser, authorizePermissions(["admin"])], uploadImage);

router.route("/:id/reviews").get(getProductReviews);

export default router;
