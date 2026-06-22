import cloudinary from "../config/cloudinary";
import Product from "../models/Product";
import fs from "fs";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { UploadedFile } from "express-fileupload";
import { BadRequestError } from "../errors";
import { Request, Response } from "express";
import { createProductSchema, updateProductSchema } from "../types";

// ===================================
// CREATE PRODUCT
// ===================================
const createProduct = async (req: Request, res: Response) => {
	const parsed = createProductSchema.safeParse(req.body);

	if (!parsed.success) {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json(z.treeifyError(parsed.error));
	}

	const product = await Product.create({
		...parsed.data,
		user: req.user?.userId,
	});

	return res.status(StatusCodes.CREATED).json(product);
};

// ===================================
// GET ALL PRODUCTS
// ===================================
const getAllProducts = async (req: Request, res: Response) => {
	const products = await Product.find({});
	return res
		.status(StatusCodes.OK)
		.json({ products, count: products.length });
};

// ===================================
// GET SINGLE PRODUCT
// ===================================
const getSingleProduct = async (req: Request, res: Response) => {
	const { id: productId } = req.params;

	const product = await Product.findOne({ _id: productId });

	if (!product) {
		return res.status(StatusCodes.NOT_FOUND).json({
			success: false,
			msg: "Product not found",
		});
	}

	return res.status(StatusCodes.OK).json({
		success: true,
		product,
	});
};

// ===================================
// UPDATE PRODUCT
// ===================================
const updateProduct = async (req: Request, res: Response) => {
	const { id: productId } = req.params;

	const parsed = updateProductSchema.safeParse(req.body);

	if (!parsed.success) {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json(z.treeifyError(parsed.error));
	}

	const product = await Product.findByIdAndUpdate(productId, parsed.data, {
		new: true,
		runValidators: true,
	});

	if (!product) {
		return res.status(StatusCodes.NOT_FOUND).json({
			msg: "Product not found",
		});
	}

	return res.status(StatusCodes.OK).json({
		msg: "Product updated successfully",
		product,
	});
};

// ===================================
// DELETE PRODUCT
// ===================================
const deleteProduct = async (req: Request, res: Response) => {
	const { id: productId } = req.params;

	const product = await Product.findOne({ _id: productId });

	if (!product) {
		return res.status(StatusCodes.NOT_FOUND).json({
			msg: `No product found with id: ${productId}`,
		});
	}

	await product.deleteOne();

	return res.status(StatusCodes.OK).json({
		msg: "Product deleted successfully",
	});
};

// ===================================
// UPLOAD PRODUCT IMAGE
// ===================================
const uploadImage = async (req: Request, res: Response) => {
	if (!req.files) {
		throw new BadRequestError("No files uploaded");
	}

	const productImage = req.files.image as UploadedFile;

	if (!productImage.mimetype.startsWith("image")) {
		throw new BadRequestError("Please upload an image file");
	}

	const maxSize = 2 * 1024 * 1024; // 2MB
	if (productImage.size > maxSize) {
		throw new BadRequestError("File size exceeds 2MB");
	}

	const upload = await cloudinary.uploader.upload(productImage.tempFilePath, {
		folder: "Products-Images",
		use_filename: true,
	});

	// Clean temp files
	try {
		await fs.promises.unlink(productImage.tempFilePath);
	} catch (error) {
		console.log("Temp file cleanup error:", error);
	}

	return res.status(StatusCodes.OK).json({
		image: upload.secure_url,
	});
};

export {
	createProduct,
	getAllProducts,
	getSingleProduct,
	updateProduct,
	deleteProduct,
	uploadImage,
};
