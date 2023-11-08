import { Model, mongo } from 'mongoose';

import CustomError from '../interfaces/CustomError';
import User from '../interfaces/User';
import HttpStatusCode from '../enums/HttpStatusCode';
import UserRepository from '../interfaces/UserRepository';
import UserModel from '../model/User.model';
import ErrorMessages from '../enums/ErrorMessages';
import UserPayload from '../interfaces/UserPayload';

class UserMongoRepository implements UserRepository {
	private readonly model: Model<User>;

	constructor(model: Model<User>) {
		this.model = model;
	}

	public async registerUser(userData: UserPayload): Promise<User> {
		return this.model.create(userData);
	}

	public async findUserByUsername(username: string): Promise<User | null>{
		return this.model.findOne({ username });
	}

	public async findUserByEmail(email: string): Promise<User | null> {
		return this.model.findOne({ email });
	}

	public async editEmail(username: string, email: string): Promise<void> {
		await this.model.findOneAndUpdate({ username }, { $set: { email } });
	}

	public async editPassword(username: string, password: string): Promise<void> {
		await this.model.findOneAndUpdate({ username }, { $set: { password } });
	}

	public handleRepositoryError(err: unknown, customError: CustomError): void {
		const DUPLICATE_FIELD_ERROR_CODE = 11000;

		if (err instanceof mongo.MongoError) {
			switch(err.code) {
			case DUPLICATE_FIELD_ERROR_CODE:
				customError.setMessage(err.message.split('{ ')[1].replace('}', '') + ErrorMessages.DUPLICATED_FIELD);
				customError.setStatus(HttpStatusCode.CONFLICT);
				throw customError;
			default:
				throw customError;
			}
		}
	}
}

export default new UserMongoRepository(UserModel);
