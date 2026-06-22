import User from "../models/User";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { loginSchema, registerSchema } from "../types";
import { BadRequestError, UnAuthenticatedError } from "../errors";
import { createUserToken, attachTokenToCookies } from "../utils";

const login = async (req: Request, res: Response) => {
	const { success, data } = loginSchema.safeParse(req.body);
	if (!success) {
		throw new BadRequestError("Please Enter valid values");
	}

	const user = await User.findOne({ email: data.email });

	if (!user) {
		throw new UnAuthenticatedError("Invalid Credentials");
	}

	const isMatch = await user.comparePassword(data.password);

	if (!isMatch) {
		throw new UnAuthenticatedError("Invalid Credentials");
	}

	const tokenUser = createUserToken(user);
	attachTokenToCookies({ res, tokenUser });
	res.status(StatusCodes.OK).json({
		user: tokenUser,
	});
};

const register = async (req: Request, res: Response) => {
	const { success, data } = registerSchema.safeParse(req.body);

	if (!success) {
		throw new BadRequestError("Please enter valid values");
	}

	const emailAlreadyExits = await User.findOne({ email: data.email });

	if (emailAlreadyExits) {
		throw new BadRequestError("Email already exists");
	}

	const countUsers = await User.countDocuments({});

	const role = countUsers === 0 ? "admin" : "user";
	const user = await User.create({
		name: data.name,
		email: data.email,
		password: data.password,
		role,
	});

	const tokenUser = createUserToken(user);
	attachTokenToCookies({ res, tokenUser });

	res.status(StatusCodes.CREATED).json({
		user: tokenUser,
	});
};

const logout = async (req: Request, res: Response) => {
	res.cookie("token", "logout", {
		httpOnly: true,
		expires: new Date(Date.now() + 1000),
	});

	res.status(StatusCodes.OK).json({
		msg: "user logged out",
	});
};

export { login, register, logout };
