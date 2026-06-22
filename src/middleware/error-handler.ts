import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

interface customError {
	statusCode: number;
	msg: string;
}

const errorHandlerMiddleware = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const customError: customError = {
		statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
		msg: err.message || "Something went wrong, Please try after some time",
	};

	if (err instanceof mongoose.Error.ValidationError) {
		(customError.msg = Object.values(err.errors)
			.map((item) => item.message)
			.join(",")),
			(customError.statusCode = 400);
	}

	if (err instanceof mongoose.Error.CastError) {
		(customError.msg = `No item found with id : ${err.value}`),
			(customError.statusCode = 404);
	}

	if (err && err.code === 11000) {
		(customError.msg = `Duplicate value entered for ${Object.keys(
			err.keyValue
		)} field, Please choose another value`),
			(customError.statusCode = StatusCodes.BAD_REQUEST);
	}

	res.status(customError.statusCode).json({
		msg: customError.msg,
	});
};

export default errorHandlerMiddleware;
