import { Model, mongo } from 'mongoose';

import CustomError from '../interfaces/CustomError';
import User from '../interfaces/User';
import HttpStatusCode from '../enums/HttpStatusCode';
import UserRepository from '../interfaces/UserRepository';
import UserModel from '../model/User.model';
import ErrorMessages from '../enums/ErrorMessages';

class UserMongoRepository implements UserRepository {
	private readonly model: Model<User>;

	constructor(model: Model<User>) {
		this.model = model;
	}

	public async registerUser(userData: User): Promise<User> {
		return this.model.create(userData);
	}

	public async findUserByUsername(username: string): Promise<User | null>{
		return this.model.findOne({ username });
	}

	public async findUserByEmail(email: string): Promise<User | null> {
		return this.model.findOne({ email });
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
