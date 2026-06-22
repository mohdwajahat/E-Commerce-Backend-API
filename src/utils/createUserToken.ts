import { Types } from "mongoose";
import { IUser } from "../models/User";

export type User = {
	userId: Types.ObjectId;
	name: string;
	role: string;
};
const createUserToken = (user: IUser): User => {
	return { userId: user._id, name: user.name, role: user.role };
};

export default createUserToken;