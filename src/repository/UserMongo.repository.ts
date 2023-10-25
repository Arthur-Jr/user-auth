import { Model } from 'mongoose';

import User from '../interfaces/User';
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
}

export default new UserMongoRepository(UserModel);
