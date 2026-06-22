import { Request, Response } from "express";
import { createReviewSchema, updateReviewSchema } from "../types";
import { z } from "zod";
import Review from "../models/Review";
import Product from "../models/Product";
import { BadRequestError, NotFoundError } from "../errors";
import { StatusCodes } from "http-status-codes";
import checkPermissions from "../utils/checkPermissions";

const getSingleReview = async (req: Request, res: Response) => {
	const { id: reviewId } = req.params;
	const review = await Review.findOne({ _id: reviewId });

	if (!review) {
		throw new NotFoundError(`No review found with id ${reviewId}`);
	}

	res.status(StatusCodes.OK).json({
		review,
	});
};

const createReview = async (req: Request, res: Response) => {
	const parsed = createReviewSchema.safeParse(req.body);

	if (!parsed.success) {
		return res.status(StatusCodes.BAD_REQUEST).json({
			msg: z.treeifyError(parsed.error),
		});
	}

	const productId = parsed.data.product;

	const isValidProduct = await Product.findOne({ _id: productId });

	if (!isValidProduct) {
		throw new NotFoundError(`No product with id : ${productId}`);
	}

	const alreadySubmitted = await Review.findOne({
		product: productId,
		user: req.user?.userId,
	});

	if (alreadySubmitted) {
		throw new BadRequestError("Already submitted review for this product");
	}

	const userId = req.user?.userId;

	const review = await Review.create({
		...parsed.data,
		user: userId,
	});

	res.status(StatusCodes.CREATED).json({
		review,
	});
};

const deleteReview = async (req: Request, res: Response) => {
	const { id: reviewId } = req.params;

	const review = await Review.findOne({ _id: reviewId });

	if (!review) {
		throw new NotFoundError(`No review with id : ${reviewId}`);
	}
	checkPermissions(req.user!, review.user);

	await review.deleteOne();
	res.status(StatusCodes.OK).json({
		msg: "Success ! review removed",
	});
};

const updateReview = async (req: Request, res: Response) => {
	const { id: reviewId } = req.params;

	const review = await Review.findOne({ _id: reviewId });

	if (!review) {
		throw new NotFoundError(`No review with id : ${reviewId}`);
	}

	checkPermissions(req.user!, review.user);

	const parsed = updateReviewSchema.safeParse(req.body);

	if (!parsed.success) {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json(z.treeifyError(parsed.error));
	}

	const { rating, title, comment } = parsed.data;
	if (rating !== undefined) {
		review.rating = rating;
	}
	if (title !== undefined) {
		review.title = title;
	}
	if (comment !== undefined) {
		review.comment = comment;
	}
	await review.save();

	res.status(StatusCodes.OK).json({
		review,
	});
};

const getProductReviews = async (req: Request, res: Response) => {
	const { id: productId } = req.params;
	const reviews = await Review.find({ product: productId }).populate({
		path: "user",
		select: "name",
	});
	res.status(StatusCodes.OK).json({
		reviews,
		count: reviews.length,
	});
};

const getAllReviews = async (req: Request, res: Response) => {
	const reviews = await Review.find({}).populate({
		path: "product",
		select: "name company price",
	});
	res.status(StatusCodes.OK).json({
		reviews,
		count: reviews.length,
	});
};

export {
	getSingleReview,
	createReview,
	deleteReview,
	updateReview,
	getProductReviews,
	getAllReviews,
};
