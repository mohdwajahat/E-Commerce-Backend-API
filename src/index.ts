/// <reference path="../types/express.d.ts" />
import express from "express";
import cloudinary from "./config/cloudinary";
import fileUpload from "express-fileupload";
import "dotenv/config";

const app = express();

// connectDb
import connectDB from "./db/connect";

// packages
import cookieParser from "cookie-parser";

// routes
import authRouter from "./routes/authRoutes";
import userRouter from "./routes/userRoutes";
import productRouter from "./routes/productRoutes";
import reviewRouter from "./routes/reviewRoutes";
import orderRouter from "./routes/orderRoutes";

// importing middlewares
import errorHandlerMiddleware from "./middleware/error-handler";
import notFoundMiddleware from "./middleware/not-found";

const PORT: number = Number(process.env.PORT) || 5000;

const cookieSecret = process.env.COOKIE_SECRET;
if (!cookieSecret) {
	throw new Error("COOKIE_SECRET must be defined in environment variables");
}

app.use(express.json());
app.use(cookieParser(cookieSecret));
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: "./temp",
	})
);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

// middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const start = async () => {
	try {
		const mongoURL = process.env.MONGO_URL;
		if (!mongoURL) {
			throw new Error(
				"Mongo URL is not defined in the environment variables"
			);
		}
		await connectDB(mongoURL);
		console.log("Successfully connected to Database");
		app.listen(PORT, () => {
			console.log(`Server is running on PORT: ${PORT}`);
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.log("server start failed", message);
	}
};

start();
