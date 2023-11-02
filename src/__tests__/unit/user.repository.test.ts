import { describe, it, vi, expect, afterEach, beforeEach } from 'vitest';
import { mongo } from 'mongoose';

import UserMongoRepository from '../../repository/UserMongo.repository';
import UserModel from '../../model/User.model';
import User from '../../interfaces/User';
import CustomErrorImp from '../../errors/CustomErrorImp';
import HttpStatusCode from '../../enums/HttpStatusCode';
import ErrorMessages from '../../enums/ErrorMessages';

describe('User route repository tests', () => {
	const userData = { username: 'test', email: 'test@email.com', password: 'testpass' };
	let customError = new CustomErrorImp();
  
	beforeEach(() => {
		customError = new CustomErrorImp();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('Register new user: should return user added to the DB', async () => {
		UserModel.create = vi.fn().mockImplementation((x: User) => x);
		const result = await UserMongoRepository.registerUser(userData);

		expect(UserModel.create).toBeCalledTimes(1);
		expect(UserModel.create).toBeCalledWith(userData);
		expect(result.username).toBe(userData.username);
		expect(result.email).toBe(userData.email);
		expect(result.password).toBe(userData.password);
	});

	it('Handle repository error: should throw a custom erro if its a duplicate mongo error', () => {
		try {
			const err = new mongo.MongoError('{ username: "test" }');
			err.code = 11000;
			UserMongoRepository.handleRepositoryError(err, customError);

		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(err.getStatus()).toBe(HttpStatusCode.CONFLICT);
				expect(err.getMessage()).contain(ErrorMessages.DUPLICATED_FIELD);
			}
		}
	});

	it('Handle repository error: should throw internal server error if its not a duplicate error', () => {
		try {
			const err = new mongo.MongoError('test');
			UserMongoRepository.handleRepositoryError(err, customError);

		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(err.getStatus()).toBe(HttpStatusCode.INTERNAL);
				expect(err.getMessage()).contain(ErrorMessages.INTERNAL_SERVER_ERROR);
			}
		}
	});

	it('Handle repository error: should not throw an error if its not a repository error', () => {
		const err = new Error('test');
		expect(() =>
			UserMongoRepository.handleRepositoryError(err, customError),
		).not.toThrowError();
	});
});
