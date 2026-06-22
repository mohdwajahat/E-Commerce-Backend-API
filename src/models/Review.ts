import mongoose, { Schema, Types, Model, Document } from "mongoose";

export interface IReview extends Document {
	rating: number;
	title: string;
	comment: string;
	user: Types.ObjectId;
	product: Types.ObjectId;
}

export interface ReviewModel extends Model<IReview> {
	calculateAverageRating(productId: Types.ObjectId): Promise<void>;
}

const ReviewSchema = new Schema<IReview, ReviewModel>(
	{
		rating: {
			type: Number,
			min: 1,
			max: 5,
			required: true,
		},
		title: {
			type: String,
			trim: true,
			required: true,
			maxlength: 100,
		},
		comment: {
			type: String,
			required: true,
			minlength: 10,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		product: {
			type: Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// ----------------------
//  Static Method
// ----------------------
ReviewSchema.statics.calculateAverageRating = async function (
	productId: Types.ObjectId
) {
	try {
		const result = await this.aggregate<{
			averageRating: number;
			numOfReviews: number;
		}>([
			{ $match: { product: productId } },
			{
				$group: {
					_id: null,
					averageRating: { $avg: "$rating" },
					numOfReviews: { $sum: 1 },
				},
			},
		]);

		const Product = mongoose.model("Product");

		const averageRating = result[0]?.averageRating ?? 0;
		const numOfReviews = result[0]?.numOfReviews ?? 0;

		await Product.findByIdAndUpdate(productId, {
			averageRating: Math.round(averageRating * 10) / 10,
			numOfReviews,
		});
	} catch (err) {
		console.error("Rating calculation error:", err);
	}
};

// ----------------------
// Central update handler
// ----------------------
const updateProductRating = async function (doc: IReview) {
	if (!doc) return;
	await (doc.constructor as ReviewModel).calculateAverageRating(doc.product);
};

// ----------------------
// Hooks
// ----------------------
ReviewSchema.post("save", updateProductRating);

ReviewSchema.post("findOneAndDelete", function (doc) {
	updateProductRating(doc);
});

ReviewSchema.post("deleteOne", { document: true, query: false }, function () {
	updateProductRating(this as IReview);
});

const Review = mongoose.model<IReview, ReviewModel>("Review", ReviewSchema);
export default Review;
