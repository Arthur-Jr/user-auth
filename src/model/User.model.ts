import { Schema, model } from 'mongoose';

import User from '../interfaces/User';

const userSchema = new Schema<User>(
	{
		username: { type: String, unique: true, required: true },
		email: { type: String, unique: true, sparse: true },
		password: { type: String, required: true },
		status: { type: Number },
	},
	{
		timestamps: true,
	}
);

export default model('Users', userSchema);
