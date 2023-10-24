import { Schema, model } from 'mongoose';

import Status from '../enums/Status';
import UserInterface from '../interfaces/UserInterface';

const userSchema = new Schema<UserInterface>({
	username: { type: String, unique: true, required: true },
	email: { type: String, unique: true },
	password: { type: String, required: true },
	status: { type: Status },
	createdAt: { type: Date, default: new Date() }
});

export default model('Users', userSchema);
