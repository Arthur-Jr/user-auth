import { Model, mongo } from 'mongoose';

import CustomError from '../interfaces/CustomError';
import User from '../interfaces/User';
import HttpStatusCode from '../enums/HttpStatusCode';
import UserRepository from '../interfaces/UserRepository';
import UserModel from '../model/User.model';

class UserMongoRepository implements UserRepository {
	private readonly model: Model<User>;

	constructor(model: Model<User>) {
		this.model = model;
	}

	public async registerUser(userData: User): Promise<User> {
		return this.model.create(userData);
	}

	public handleRepositoryError(err: unknown, customError: CustomError): void {
		if (err instanceof mongo.MongoError) {
			customError.setMessage('');
			customError.setStatus(HttpStatusCode.CONFLICT);
			console.log(customError);
		}
	}
}

export default new UserMongoRepository(UserModel);
