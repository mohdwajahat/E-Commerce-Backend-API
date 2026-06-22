import { z } from "zod";

// auth routes
const loginSchema = z.object({
	email: z.string().min(1, "email cannot be empty"),
	password: z.string().min(1, "password cannot be empty"),
});

const registerSchema = z.object({
	name: z.string().min(1, "username cannot be empty"),
	email: z.string().min(1, "email cannot be empty"),
	password: z.string().min(1, "password cannot be empty"),
});

// product routes

const createProductSchema = z.object({
	name: z.string().min(1).max(100),
	price: z.number().min(0),
	description: z.string().min(1).max(1000),
	image: z.string(),
	category: z.enum(["office", "kitchen", "bedroom"]),
	company: z.enum(["ikea", "liddy", "marcos"]),
	colors: z.array(z.string()),
	featured: z.boolean().default(false).optional(),
	freeShipping: z.boolean().default(false).optional(),
	inventory: z.number().default(15),
	averageRating: z.number().default(0),
	numOfReviews: z.number().default(0),
});

const updateProductSchema = createProductSchema.partial();

const createReviewSchema = z.object({
	rating: z.number(),
	title: z.string().min(1).max(100),
	comment: z.string().min(1),
	product: z.string().min(1),
});

const singleOrderItemSchema = z.object({
	name: z.string().min(1),
	image: z.string().url().min(1),
	price: z.number().min(0),
	amount: z.number().min(1),
	product: z.string(), // Mongo ObjectId as string
});

const orderSchema = z.object({
	tax: z.number().min(0),
	shippingFee: z.number().min(0),
	orderItem: z.array(singleOrderItemSchema).min(1),
});

const updateReviewSchema = createReviewSchema
	.omit({
		product: true,
	})
	.partial();

export {
	loginSchema,
	registerSchema,
	createProductSchema,
	updateProductSchema,
	createReviewSchema,
	updateReviewSchema,
	orderSchema,
	singleOrderItemSchema,
};
