/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, vi, expect, afterEach, beforeEach } from 'vitest';
import ZodPayloadValidator, { userLoginSchema } from '../../zod/ZodPayloadValidator';
import UserMongoRepository from '../../repository/UserMongo.repository';
import JwtAuth from '../../auth/JwtAuth';
import BCryptPassword from '../../crypt/BCryptPassword';
import CustomErrorImp from '../../errors/CustomErrorImp';
import CustomError from '../../interfaces/CustomError';
import LoginService from '../../interfaces/LoginService';
import { LoginServiceImp } from '../../service/Login.service';
import UserPayload from '../../interfaces/UserPayload';
import Status from '../../enums/Status';
import HttpStatusCode from '../../enums/HttpStatusCode';
import ErrorMessages from '../../enums/ErrorMessages';

describe('Login service unit tests', () => {
	const mockValidator = new ZodPayloadValidator(userLoginSchema);
	const mockAuth = new JwtAuth();
	const mockCrypt = new BCryptPassword();
	let customError: CustomError;
	let service: LoginService;
	let userData: UserPayload;
	const foundedUser = { _id: 1, username: 'test', email: 'email@email.com', password: 'testPassCrypt', status: Status.VALID_ACC };
	const foundedTestUser = {
		_id: 1, username: 'test', email: 'email@email.com', password: 'testPassCrypt', status: Status.TEST_ACC, createdAt: new Date()
	};
	const testError = new Error('test Error');

	beforeEach(() => {
		customError = new CustomErrorImp();
		service = new LoginServiceImp(UserMongoRepository, mockValidator, customError, mockAuth, mockCrypt);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('Login method: should return a token if login with username is valid', async () => {
		userData = { username: 'test', password: 'testPass' };
		const expectedValue = { token: 'test' };

		mockValidator.validatePayload = vi.fn();
		UserMongoRepository.findUserByUsername = vi.fn().mockImplementation(() => foundedUser);
		UserMongoRepository.deleteUser = vi.fn();
		mockCrypt.checkPassword = vi.fn();
		mockAuth.getToken = vi.fn().mockImplementation((_x) => expectedValue.token);
		const result = await service.login(userData);

		expect(mockValidator.validatePayload).toBeCalledTimes(1);
		expect(mockValidator.validatePayload).toBeCalledWith(userData);
		expect(UserMongoRepository.findUserByUsername).toBeCalledTimes(1);
		expect(UserMongoRepository.findUserByUsername).toBeCalledWith(userData.username);
		expect(mockCrypt.checkPassword).toBeCalledTimes(1);
		expect(mockCrypt.checkPassword).toBeCalledWith(userData.password, foundedUser.password, customError);
		expect(UserMongoRepository.deleteUser).toBeCalledTimes(0);
		expect(mockAuth.getToken).toBeCalledTimes(1);
		expect(mockAuth.getToken).toBeCalledWith({ username: foundedUser.username, status: foundedUser.status });
		expect(result).toStrictEqual(expectedValue);
	});

	it('Login method: should return a token if login with email is valid', async () => {
		userData = { email: 'test', password: 'testPass' };
		const expectedValue = { token: 'test' };

		mockValidator.validatePayload = vi.fn();
		UserMongoRepository.findUserByEmail = vi.fn().mockImplementation(() => foundedUser);
		UserMongoRepository.deleteUser = vi.fn();
		mockCrypt.checkPassword = vi.fn();
		mockAuth.getToken = vi.fn().mockImplementation((_x) => expectedValue.token);
		const result = await service.login(userData);

		expect(mockValidator.validatePayload).toBeCalledTimes(1);
		expect(mockValidator.validatePayload).toBeCalledWith(userData);
		expect(UserMongoRepository.findUserByEmail).toBeCalledTimes(1);
		expect(UserMongoRepository.findUserByEmail).toBeCalledWith(userData.email);
		expect(mockCrypt.checkPassword).toBeCalledTimes(1);
		expect(mockCrypt.checkPassword).toBeCalledWith(userData.password, foundedUser.password, customError);
		expect(UserMongoRepository.deleteUser).toBeCalledTimes(0);
		expect(mockAuth.getToken).toBeCalledTimes(1);
		expect(mockAuth.getToken).toBeCalledWith({ username: foundedUser.username, status: foundedUser.status });
		expect(result).toStrictEqual(expectedValue);
	});

	it('Login method: should return a token if test acc is still valid', async () => {
		userData = { email: 'test', password: 'testPass' };
		const expectedValue = { token: 'test' };

		mockValidator.validatePayload = vi.fn();
		UserMongoRepository.findUserByEmail = vi.fn().mockImplementation(() => foundedTestUser);
		mockCrypt.checkPassword = vi.fn();
		UserMongoRepository.deleteUser = vi.fn();
		mockAuth.getToken = vi.fn().mockImplementation((_x) => expectedValue.token);

		const result = await service.login(userData);

		expect(mockValidator.validatePayload).toBeCalledTimes(1);
		expect(mockValidator.validatePayload).toBeCalledWith(userData);
		expect(UserMongoRepository.findUserByEmail).toBeCalledTimes(1);
		expect(UserMongoRepository.findUserByEmail).toBeCalledWith(userData.email);
		expect(mockCrypt.checkPassword).toBeCalledTimes(1);
		expect(mockCrypt.checkPassword).toBeCalledWith(userData.password, foundedUser.password, customError);
		expect(UserMongoRepository.deleteUser).toBeCalledTimes(0);
		expect(mockAuth.getToken).toBeCalledTimes(1);
		expect(mockAuth.getToken).toBeCalledWith({ username: foundedTestUser.username, status: foundedTestUser.status });
		expect(result).toStrictEqual(expectedValue);
	});

	it('Login method: should delete user and throw an error if test acc is not valid anymore', async () => {
		try {
			userData = { email: 'test', password: 'testPass' };
			foundedTestUser.createdAt = new Date(foundedTestUser.createdAt.setDate(foundedTestUser.createdAt.getDate()) - 30);
			const expectedValue = { token: 'test' };
	
			mockValidator.validatePayload = vi.fn();
			UserMongoRepository.findUserByEmail = vi.fn().mockImplementation(() => foundedTestUser);
			mockCrypt.checkPassword = vi.fn();
			UserMongoRepository.deleteUser = vi.fn();
			mockAuth.getToken = vi.fn().mockImplementation((_x) => expectedValue.token);
	
			await service.login(userData);

		} catch(err) {
			expect(mockValidator.validatePayload).toBeCalledTimes(1);
			expect(mockValidator.validatePayload).toBeCalledWith(userData);
			expect(UserMongoRepository.findUserByEmail).toBeCalledTimes(1);
			expect(UserMongoRepository.findUserByEmail).toBeCalledWith(userData.email);
			expect(mockCrypt.checkPassword).toBeCalledTimes(1);
			expect(mockCrypt.checkPassword).toBeCalledWith(userData.password, foundedUser.password, customError);
			expect(UserMongoRepository.deleteUser).toBeCalledTimes(1);
			expect(mockAuth.getToken).toBeCalledTimes(1);
			expect(mockAuth.getToken).toBeCalledWith({ username: foundedTestUser.username, status: foundedTestUser.status });
			if (err instanceof CustomErrorImp) {
				expect(err.getStatus()).toBe(HttpStatusCode.UNAUTHORIZED);
				expect(err.getMessage()).toBe(ErrorMessages.TEST_ACC_DELETED);
			}
		}
	});

	it('Login method: should throw an error if user is not founded', async () => {
		userData = { username: 'test1', password: 'testPass' };

		try {
			mockValidator.validatePayload = vi.fn();
			UserMongoRepository.findUserByUsername = vi.fn().mockImplementation(() => null);
			await service.login(userData);

		} catch(err) {
			expect(mockValidator.validatePayload).toBeCalledTimes(1);
			expect(mockValidator.validatePayload).toBeCalledWith(userData);
			expect(UserMongoRepository.findUserByUsername).toBeCalledTimes(1);
			expect(UserMongoRepository.findUserByUsername).toBeCalledWith(userData.username);
			if (err instanceof CustomErrorImp) {
				expect(err.getStatus()).toBe(HttpStatusCode.NOT_FOUND);
				expect(err.getMessage()).toBe(ErrorMessages.USER_NOT_FOUND);
			}
		}
	});

	it('Login method: should throw a custom Error if repository throw error.', async () => {
		try {
			userData = { username: 'test', password: 'testPass' };
  
			mockValidator.validatePayload = vi.fn();
			UserMongoRepository.findUserByUsername = vi.fn().mockImplementation(() => {
				throw testError;
			});

			UserMongoRepository.handleRepositoryError = vi.fn().mockImplementation(() => {
				customError.setMessage('Repository Error');
				customError.setStatus(HttpStatusCode.BAD_REQUEST);
				throw customError;
			});

			await service.login(userData);
		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(mockValidator.validatePayload).toBeCalledTimes(1);
				expect(UserMongoRepository.findUserByUsername).toBeCalledTimes(1);
				expect(UserMongoRepository.handleRepositoryError).toBeCalledTimes(1);
				expect(UserMongoRepository.handleRepositoryError).toBeCalledWith(testError, customError);
				expect(err.getStatus()).toBe(HttpStatusCode.BAD_REQUEST);
				expect(err.getMessage()).toBe('Repository Error');
			}
		}
	});

	it('Login method: should throw a internal server error if occur an unknown error', async () => {
		userData = { username: 'test', password: 'testPass' };
    
		try {
			mockValidator.validatePayload = vi.fn();
			mockValidator.handleValidateError = vi.fn();
			mockValidator.validatePayload = vi.fn();
			UserMongoRepository.findUserByUsername = vi.fn().mockImplementation(() => {
				throw testError;
			});
			UserMongoRepository.handleRepositoryError = vi.fn();

			await service.login(userData);
		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(mockValidator.validatePayload).toBeCalledTimes(1);
				expect(mockValidator.handleValidateError).toBeCalledTimes(1);
				expect(UserMongoRepository.findUserByUsername).toBeCalledTimes(1);
				expect(UserMongoRepository.handleRepositoryError).toBeCalledTimes(1);
				expect(err.getStatus()).toBe(HttpStatusCode.INTERNAL);
				expect(err.getMessage()).toBe('Internal Server Error!');
			}
		}
	});

	it('Login method: should throw an Error if payload is invalid', async () => {
		try {
			mockValidator.validatePayload = vi.fn().mockImplementation(() => {
				throw testError;
			});

			mockValidator.handleValidateError = vi.fn().mockImplementation(() => {
				customError.setMessage('Validate Error');
				customError.setStatus(HttpStatusCode.BAD_REQUEST);
				throw customError;
			});

			await service.login(userData);
		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(mockValidator.validatePayload).toBeCalledTimes(1);
				expect(UserMongoRepository.findUserByUsername).toBeCalledTimes(0);
				expect(mockValidator.handleValidateError).toBeCalledTimes(1);
				expect(mockValidator.handleValidateError).toBeCalledWith(testError, customError);
				expect(err.getStatus()).toBe(HttpStatusCode.BAD_REQUEST);
				expect(err.getMessage()).toBe('Validate Error');
			}
		}
	});

});
