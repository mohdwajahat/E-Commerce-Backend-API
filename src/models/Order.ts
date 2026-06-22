import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISingleOrderItem {
	name: string;
	image: string;
	price: number;
	amount: number;
	product: Types.ObjectId;
}

export interface IOrder extends Document {
	tax: number;
	shippingFee: number;
	subTotal: number;
	total: number;
	orderItem: ISingleOrderItem[];
	status: "pending" | "failed" | "paid" | "delivered" | "cancelled";
	user: Types.ObjectId;
	clientSecret: string;
	paymentIntentId?: string;
	createdAt: Date;
	updatedAt: Date;
}

const singleOrderSchema: Schema<ISingleOrderItem> = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	product: {
		type: mongoose.Schema.ObjectId,
		ref: "Product",
		required: true,
	},
});

const OrderSchema: Schema<IOrder> = new mongoose.Schema(
	{
		tax: {
			type: Number,
			required: true,
		},
		shippingFee: {
			type: Number,
			required: true,
		},
		subTotal: {
			type: Number,
			required: true,
		},
		total: {
			type: Number,
			required: true,
		},
		orderItem: {
			type: [singleOrderSchema],
			required: true,
		},
		status: {
			type: String,
			enum: {
				values: ["pending", "failed", "paid", "delivered", "cancelled"],
				message: "{VALUE} is not allowed",
			},
			default: "pending",
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
			required: true,
		},
		clientSecret: {
			type: String,
			required: true,
		},
		paymentIntentId: {
			type: String,
		},
	},
	{ timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
