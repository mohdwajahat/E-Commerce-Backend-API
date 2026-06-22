import mongoose from "mongoose";

const connectDB = (URL: string): Promise<typeof mongoose> => {
	return mongoose.connect(URL, {
		dbName: "E-commerce",
	});
};

export default connectDB;
