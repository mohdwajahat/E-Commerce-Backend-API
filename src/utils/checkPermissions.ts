import { Types } from "mongoose";
import { UnAuthenticatedError } from "../errors";
import type { User } from "./createUserToken";

const checkPermissions = (requestUser: User, reviewUser: Types.ObjectId) => {
	if (requestUser.role === "admin") {
		return;
	}
	if (requestUser.userId.equals(reviewUser)) {
		return;
	}
	throw new UnAuthenticatedError("Not Authorized to access this route");
};

export default checkPermissions;
