import { Request, Response, NextFunction } from "express";
import { UnAuthenticatedError } from "../errors";
import { isTokenValid } from "../utils/jwt";
import type { User } from "../utils/createUserToken";

const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
	const token = req.signedCookies.token;
	
	if (!token) {
		throw new UnAuthenticatedError("Authentication Invalid");
	}
	try {
		const { name, userId, role } = isTokenValid({ token }) as User;
		req.user = { userId, name, role };
		next();
	} catch (error) {
		throw new UnAuthenticatedError("Authentication Invalid");
	}
};

const authorizePermissions = (roles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const userRole = req.user?.role;
		if (!userRole || !roles.includes(userRole)) {
			throw new UnAuthenticatedError("Unauthorized to access the route");
		}
		next();
	};
};

export { authenticateUser, authorizePermissions };
