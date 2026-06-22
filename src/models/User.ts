import mongoose, { Schema, Document, Types } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
	_id: Types.ObjectId;
	name: string;
	email: string;
	password: string;
	role: "user" | "admin";
	comparePassword(userPassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please provide name"],
		minlength: 3,
		maxlength: 50,
	},
	email: {
		type: String,
		unique: true,
		required: [true, "Please provide the email"],
		validate: {
			validator: (value: string) => validator.isEmail(value),
			message: "please provide a valid Email",
		},
	},
	password: {
		type: String,
		required: [true, " Please provide a password"],
		minlength: 6,
	},
	role: {
		type: String,
		enum: ["admin", "user"],
		default: "user",
	},
});

UserSchema.pre("save", async function () {
	if (!this.isModified("password")) {
		return;
	}
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (
	userPassword: string
): Promise<boolean> {
	return await bcrypt.compare(userPassword, this.password);
};

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
