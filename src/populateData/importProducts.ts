import mongoose from "mongoose";
import Product from "../models/Product";
import connectDB from "../db/connect";
import "dotenv/config";
import fs from "fs";
import path from "path";

const mongoURl = process.env.MONGO_URL!;
const products = JSON.parse(
	fs.readFileSync(
		path.resolve(__dirname, "../mockData/products.json"),
		"utf-8"
	)
);

const start = async () => {
	try {
		await connectDB(mongoURl!);
		await Product.deleteMany({});
		// this file wont work. because the user property is not add in the product.json file 
		await Product.insertMany(products);
		console.log("data inserted successfully");
		process.exit(0);
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};

start();
