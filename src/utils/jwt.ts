import jwt from "jsonwebtoken";
import { Response } from "express";
import type { User } from "./createUserToken";

const JWT_SECRET = process.env.JWT_SECRET!;

const createToken = ({ payload }: { payload: User }): string => {
	const token = jwt.sign(payload, JWT_SECRET, {
		expiresIn: "30d",
	});
	return token;
};

const isTokenValid = ({ token }: { token: string }) => {
	return jwt.verify(token, JWT_SECRET);
};

const attachTokenToCookies = ({
	res,
	tokenUser,
}: {
	res: Response;
	tokenUser: User;
}) => {
	const token = createToken({ payload: tokenUser });

	const oneDay = 1000 * 60 * 60 * 24;
	res.cookie("token", token, {
		httpOnly: true,
		expires: new Date(Date.now() + oneDay),
		secure: process.env.NODE_ENV === "production",
		signed: true,
	});
};

export { attachTokenToCookies, isTokenValid };
