import { describe, it, vi, expect, afterEach, beforeEach } from 'vitest';
import { mongo } from 'mongoose';

import UserMongoRepository from '../../repository/UserMongo.repository';
import UserModel from '../../model/User.model';
import CustomErrorImp from '../../errors/CustomErrorImp';
import HttpStatusCode from '../../enums/HttpStatusCode';
import ErrorMessages from '../../enums/ErrorMessages';
import Status from '../../enums/Status';
import UserPayload from '../../interfaces/UserPayload';

describe('User route repository tests', () => {
	const userData = { username: 'test', email: 'test@email.com', password: 'testpass', status: Status.VALID_ACC };
	let customError = new CustomErrorImp();
  
	beforeEach(() => {
		customError = new CustomErrorImp();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('Register new user: should return user added to DB', async () => {
		UserModel.create = vi.fn().mockImplementation((x: UserPayload) => x);
		const result = await UserMongoRepository.registerUser(userData);

		expect(UserModel.create).toBeCalledTimes(1);
		expect(UserModel.create).toBeCalledWith(userData);
		expect(result.username).toBe(userData.username);
		expect(result.email).toBe(userData.email);
		expect(result.status).toBe(Status.VALID_ACC);
		expect(result.password).toBe(userData.password);
	});

	it('Find user by username: should return user if user is finded', async () => {
		UserModel.findOne = vi.fn().mockImplementation(() => userData);
		const result = await UserMongoRepository.findUserByUsername(userData.username);

		expect(UserModel.findOne).toBeCalledTimes(1);
		expect(UserModel.findOne).toBeCalledWith({ username: userData.username });
		expect(result?.username).toBe(userData.username);
	});

	it('Find user by username: should return null if user is not finded', async () => {
		UserModel.findOne = vi.fn().mockImplementation(() => null);
		const result = await UserMongoRepository.findUserByUsername(userData.username);

		expect(UserModel.findOne).toBeCalledTimes(1);
		expect(UserModel.findOne).toBeCalledWith({ username: userData.username });
		expect(result).toBe(null);
	});

	it('Find user by email: should return user if user is finded', async () => {
		UserModel.findOne = vi.fn().mockImplementation(() => userData);
		const result = await UserMongoRepository.findUserByEmail(userData.email);

		expect(UserModel.findOne).toBeCalledTimes(1);
		expect(UserModel.findOne).toBeCalledWith({ email: userData.email });
		expect(result?.email).toBe(userData.email);
	});

	it('Find user by email: should return null if user is not finded', async () => {
		UserModel.findOne = vi.fn().mockImplementation(() => null);
		const result = await UserMongoRepository.findUserByEmail(userData.email);

		expect(UserModel.findOne).toBeCalledTimes(1);
		expect(UserModel.findOne).toBeCalledWith({ email: userData.email });
		expect(result).toBe(null);
	});

	it('Edit user email: should edit email', async () => {
		UserModel.findOneAndUpdate = vi.fn().mockImplementation(async () => userData);
		await UserMongoRepository.editEmail(userData.username, userData.email);

		expect(UserModel.findOneAndUpdate).toBeCalledTimes(1);
		expect(UserModel.findOneAndUpdate).toBeCalledWith({ username: userData.username }, { $set: { email: userData.email } });
	});

	it('Edit user password: should edit password', async () => {
		UserModel.findOneAndUpdate = vi.fn().mockImplementation(async () => userData);
		await UserMongoRepository.editPassword(userData.username, userData.password);

		expect(UserModel.findOneAndUpdate).toBeCalledTimes(1);
		expect(UserModel.findOneAndUpdate).toBeCalledWith({ username: userData.username }, { $set: { password: userData.password } });
	});

	it('Add email to test user: should add new email and change status', async () => {
		UserModel.findOneAndUpdate = vi.fn().mockImplementation(async () => userData);
		await UserMongoRepository.addEmailToTestUser(userData.username, userData.email, Status.VALID_ACC);

		expect(UserModel.findOneAndUpdate).toBeCalledTimes(1);
		expect(UserModel.findOneAndUpdate).toBeCalledWith(
			{ username: userData.username },
			{ $set: { email: userData.email, status: Status.VALID_ACC } }
		);
	});

	it('Delete user: should delete user', async () => {
		UserModel.findOneAndDelete= vi.fn().mockImplementation(async () => null);
		await UserMongoRepository.deleteUser(userData.username);

		expect(UserModel.findOneAndDelete).toBeCalledTimes(1);
		expect(UserModel.findOneAndDelete).toBeCalledWith({ username: userData.username });
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
