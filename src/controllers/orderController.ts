import { Request, Response } from "express";
import Order from "../models/Order";
import { z } from "zod";
import { NotFoundError } from "../errors";
import { StatusCodes } from "http-status-codes";
import checkPermissions from "../utils/checkPermissions";
import { orderSchema, singleOrderItemSchema } from "../types";
import Product from "../models/Product";

const fakeStripeAPI = async ({
	amount,
	currency,
}: {
	amount: number;
	currency: string;
}) => {
	const client_secret = "someRandomValue";
	return { client_secret, amount };
};

const getAllOrders = async (req: Request, res: Response) => {
	const orders = await Order.find({});
	res.status(StatusCodes.OK).json({
		orders,
		count: orders.length,
	});
};

const getSingleOrder = async (req: Request, res: Response) => {
	const { id: orderId } = req.params;
	const order = await Order.findOne({ _id: orderId });

	if (!order) {
		throw new NotFoundError(`No order exists with id : ${orderId}`);
	}

	checkPermissions(req.user!, order.user);
	res.status(StatusCodes.OK).json({
		order,
	});
};

const getCurrentUserOrders = async (req: Request, res: Response) => {
	const userId = req.user?.userId;
	const orders = await Order.find({ user: userId });
	res.status(StatusCodes.OK).json({
		orders,
		count: orders.length,
	});
};

const createOrder = async (req: Request, res: Response) => {
	const parsed = orderSchema.safeParse(req.body);

	if (!parsed.success) {
		return res
			.status(StatusCodes.BAD_REQUEST)
			.json(z.treeifyError(parsed.error));
	}

	const { tax, shippingFee, orderItem: cartItems } = parsed.data;

	let orderItems: z.infer<typeof singleOrderItemSchema>[] = [];
	let subTotal = 0;

	for (const item of cartItems) {
		const dbProduct = await Product.findOne({ _id: item.product });
		if (!dbProduct) {
			throw new NotFoundError(`No product with id : ${item.product}`);
		}
		const { name, image, price, _id } = dbProduct;

		const orderItem = {
			name,
			image,
			price,
			amount: item.amount,
			product: _id as string,
		};

		orderItems.push(orderItem);

		subTotal += item.amount * price;
	}

	const total = subTotal + tax + shippingFee;

	const paymentIntent = await fakeStripeAPI({
		amount: total,
		currency: "usd",
	});

	const order = await Order.create({
		tax,
		shippingFee,
		subTotal,
		total,
		orderItems,
		clientSecret: paymentIntent.client_secret,
		user: req.user?.userId,
	});

	res.status(StatusCodes.CREATED).json({
		order,
		clientSecret: order.clientSecret,
	});
};

const updateOrder = async (req: Request, res: Response) => {
	const { id: orderId } = req.params;
	const { paymentIntentId } = req.body;

	const order = await Order.findOne({ _id: orderId });

	if (!order) {
		throw new NotFoundError(`No order with id : ${orderId}`);
	}

	checkPermissions(req.user!, order.user);

	order.paymentIntentId = paymentIntentId;
	order.status = "paid";
	await order.save();

	res.status(StatusCodes.OK).json({
		order,
	});
};

export {
	getAllOrders,
	getSingleOrder,
	getCurrentUserOrders,
	updateOrder,
	createOrder,
};
