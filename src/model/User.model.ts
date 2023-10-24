import { Schema, model } from 'mongoose';
import Status from '../enums/status';

const userSchema = new Schema({
	username: { type: String, unique: true, required: true },
	email: { type: String, unique: true },
	password: { type: String, required: true },
	status: { type: Status },
	createdAt: { type: Date, default: new Date() }
});

export default model('Users', userSchema);
