import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import User from "../models/User";
import {
	BadRequestError,
	NotFoundError,
	UnAuthenticatedError,
} from "../errors";
import checkPermissions from "../utils/checkPermissions";
import { Types } from "mongoose";
import { attachTokenToCookies, createUserToken } from "../utils";

const getAllUsers = async (req: Request, res: Response) => {
	const users = await User.find({ role: "user" }).select("-password");
	res.status(StatusCodes.OK).json({
		users,
	});
};

const getSingleUser = async (req: Request, res: Response) => {
	const { id: userId } = req.params;

	const user = await User.findOne({ _id: userId }).select("-password");

	if (!user) {
		throw new NotFoundError(`No user exists with userId : ${userId}`);
	}

	checkPermissions(req.user!, user._id);
	res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req: Request, res: Response) => {
	res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req: Request, res: Response) => {
	const { email, name } = req.body;

	if (!email || !name) {
		throw new BadRequestError("Enter valid values for email and name");
	}

	const user = await User.findOne({ _id: req.user?.userId });

	if (!user) {
		throw new NotFoundError(`No user exists with id : ${req.user?.userId}`);
	}

	user.email = email;
	user.name = name;

	await user.save();

	const tokenUser = createUserToken(user);
	attachTokenToCookies({ res, tokenUser });

	res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req: Request, res: Response) => {
	const { oldPassword, newPassword } = req.body;

	if (!oldPassword || !newPassword) {
		throw new BadRequestError("Enter valid values for password input");
	}

	const user = await User.findOne({ _id: req.user?.userId });

	if (!user) {
		throw new NotFoundError(
			`No such user exists with id : ${req.user?.userId}`
		);
	}

	const isMatch = await user.comparePassword(oldPassword);

	if (!isMatch) {
		throw new UnAuthenticatedError("Invalid Credentials");
	}

	user.password = newPassword;
	await user.save();

	res.status(StatusCodes.OK).json({
		msg: "success ! password updated Successfully",
	});
};

export {
	getAllUsers,
	getSingleUser,
	showCurrentUser,
	updateUser,
	updateUserPassword,
};
