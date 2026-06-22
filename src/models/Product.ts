import mongoose, { Schema, Document, Types } from "mongoose";
import Review from "./Review";

export interface IProduct extends Document {
	name: string;
	price: number;
	description: string;
	image: string;
	category: "office" | "kitchen" | "bedroom";
	company: "ikea" | "liddy" | "marcos";
	colors: string[];
	featured: boolean;
	freeShipping: boolean;
	inventory: number;
	averageRating: number;
	numOfReviews: number;
	user: Types.ObjectId;
}

const ProductSchema: Schema<IProduct> = new mongoose.Schema(
	{
		name: {
			type: String,
			trim: true,
			required: [true, "Please provide product name"],
			maxlength: [100, "Name can not be more than 100 characters"],
		},
		price: {
			type: Number,
			required: [true, "Please provide product price"],
			default: 0,
		},
		description: {
			type: String,
			required: [true, "Please provide product description"],
			maxlength: [
				1000,
				"Description can not be more than 1000 characters",
			],
		},
		image: {
			type: String,
			default: "/uploads/example.jpeg",
		},
		category: {
			type: String,
			required: [true, "Please provide product category"],
			enum: ["office", "kitchen", "bedroom"],
		},
		company: {
			type: String,
			required: [true, "Please provide company"],
			enum: {
				values: ["ikea", "liddy", "marcos"],
				message: "{VALUE} is not supported",
			},
		},
		colors: {
			type: [String],
			default: ["#222"],
			required: true,
		},
		featured: {
			type: Boolean,
			default: false,
		},
		freeShipping: {
			type: Boolean,
			default: false,
		},
		inventory: {
			type: Number,
			required: true,
			default: 15,
		},
		averageRating: {
			type: Number,
			default: 0,
		},
		numOfReviews: {
			type: Number,
			default: 0,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
	//“Whenever this product tries to turn itself into JSON or a plain object, include virtual fields too—don’t hide them in its internal Mongoose brain.”
);

ProductSchema.virtual("reviews", {
	ref: "Review",
	localField: "_id",
	foreignField: "product",
	justOne: false,
});

ProductSchema.pre(
	"deleteOne",
	{ document: true, query: false },
	async function () {
		const productId = this._id;
		await Review.deleteMany({ product: productId });
	}
);

const Product = mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
