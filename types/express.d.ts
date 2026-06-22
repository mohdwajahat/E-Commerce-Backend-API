import "express";
import { Types } from "mongoose";

declare global {
	namespace Express {
		interface Request {
			user?: {
				userId: Types.ObjectId;
				name: string;
				role: string;
			};
		}
	}
}

