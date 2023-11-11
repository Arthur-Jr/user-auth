/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, vi, expect, afterEach, beforeEach } from 'vitest';

import CustomErrorImp from '../../errors/CustomErrorImp';
import JwtAuth from '../../auth/JwtAuth';
import HttpStatusCode from '../../enums/HttpStatusCode';
import UserMongoRepository from '../../repository/UserMongo.repository';
import User from '../../interfaces/User';
import { RegisterService } from '../../service/Register.service';
import Status from '../../enums/Status';
import ZodPayloadValidator, { userRegisterSchema } from '../../zod/ZodPayloadValidator';
import BCryptPassword from '../../crypt/BCryptPassword';
import IRegisterService from '../../interfaces/IRegisterService';
import EmailValidatorImp from '../../mail/EmailValidatorImp';

describe('Register service unit tests:', () => {
	const mockValidator = new ZodPayloadValidator(userRegisterSchema);
	const mockAuth = new JwtAuth();
	const mockCrypt = new BCryptPassword();
	const mockEmailValidator = new EmailValidatorImp();
	let customError = new CustomErrorImp();
	let service: IRegisterService;
	const userData = { username: 'test', email: 'test@email.com', password: 'testpass' };
	const userTestData = { username: 'test', password: 'testpass' };
	const cryptedPassword = 'cryptedPassword';
	const testError = new Error('test Error');

	beforeEach(() => {
		customError = new CustomErrorImp();
		service = new RegisterService(UserMongoRepository, mockValidator, customError, mockAuth, mockCrypt, mockEmailValidator);
	});
  
	afterEach(() => {
		vi.clearAllMocks();
	});

	it('Register test user: should return a token if everything is okay ', async () => {
		const expectedValue = { token: 'test' };

		mockValidator.validatePayload = vi.fn();
		mockEmailValidator.checkIfEmailIsReal = vi.fn();
		UserMongoRepository.registerUser = vi.fn().mockImplementation(({ username, status }: User) => ({ username, status }));
		mockCrypt.cryptPassword = vi.fn().mockImplementation(() => cryptedPassword);
		mockAuth.getToken = vi.fn().mockImplementation((_x) => expectedValue.token);

		const serviceReturn = await service.registerNewUser(userTestData);

		expect(mockValidator.validatePayload).toBeCalledTimes(1);
		expect(mockValidator.validatePayload).toBeCalledWith(userTestData);
		expect(mockEmailValidator.checkIfEmailIsReal).toBeCalledTimes(0);
		expect(UserMongoRepository.registerUser).toBeCalledTimes(1);
		expect(UserMongoRepository.registerUser).toBeCalledWith({ ...userTestData, password: cryptedPassword, status: Status.TEST_ACC });
		expect(mockCrypt.cryptPassword).toBeCalledTimes(1);
		expect(mockCrypt.cryptPassword).toBeCalledWith(userTestData.password);
		expect(mockAuth.getToken).toBeCalledTimes(1);
		expect(mockAuth.getToken).toBeCalledWith({ username: userTestData.username, status: Status.TEST_ACC });
		expect(serviceReturn).toStrictEqual(expectedValue);
	});

	it('Register new user: should return a token if everything is okay', async () => {
		const expectedValue = { token: 'test' };

		mockValidator.validatePayload = vi.fn();
		mockEmailValidator.checkIfEmailIsReal = vi.fn();
		UserMongoRepository.registerUser = vi.fn().mockImplementation(({ username, status }: User) => ({ username, status }));
		mockCrypt.cryptPassword = vi.fn().mockImplementation(() => cryptedPassword);
		mockAuth.getToken = vi.fn().mockImplementation((_x) => expectedValue.token);
		const serviceReturn = await service.registerNewUser(userData);

		expect(mockValidator.validatePayload).toBeCalledTimes(1);
		expect(mockValidator.validatePayload).toBeCalledWith(userData);
		expect(mockEmailValidator.checkIfEmailIsReal).toBeCalledTimes(1);
		expect(UserMongoRepository.registerUser).toBeCalledTimes(1);
		expect(UserMongoRepository.registerUser).toBeCalledWith({ ...userData, password: cryptedPassword, status: Status.VALID_ACC });
		expect(mockCrypt.cryptPassword).toBeCalledTimes(1);
		expect(mockCrypt.cryptPassword).toBeCalledWith(userData.password);
		expect(mockAuth.getToken).toBeCalledTimes(1);
		expect(mockAuth.getToken).toBeCalledWith({ username: userData.username, status: Status.VALID_ACC });
		expect(serviceReturn).toStrictEqual(expectedValue);
	});

	it('Register new user: should throw an Error if payload is invalid', async () => {
		try {
			mockValidator.validatePayload = vi.fn().mockImplementation(() => {
				throw testError;
			});

			mockValidator.handleValidateError = vi.fn().mockImplementation(() => {
				customError.setMessage('Validate Error');
				customError.setStatus(HttpStatusCode.BAD_REQUEST);
				throw customError;
			});

			await service.registerNewUser(userData);
		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(mockValidator.validatePayload).toBeCalledTimes(1);
				expect(UserMongoRepository.registerUser).toBeCalledTimes(0);
				expect(mockValidator.handleValidateError).toBeCalledTimes(1);
				expect(mockValidator.handleValidateError).toBeCalledWith(testError, customError);
				expect(err.getStatus()).toBe(HttpStatusCode.BAD_REQUEST);
				expect(err.getMessage()).toBe('Validate Error');
			}
		}
	});

	it('Register new user: should throw a custom Error if repository throw error.', async () => {
		try {
			mockCrypt.cryptPassword = vi.fn().mockImplementation(() => cryptedPassword);
			mockEmailValidator.checkIfEmailIsReal = vi.fn();
			mockValidator.validatePayload = vi.fn();
			mockValidator.handleValidateError = vi.fn();
			UserMongoRepository.registerUser = vi.fn().mockImplementation(() => {
				throw testError;
			});

			UserMongoRepository.handleRepositoryError = vi.fn().mockImplementation(() => {
				customError.setMessage('Repository Error');
				customError.setStatus(HttpStatusCode.CONFLICT);
				throw customError;
			});

			await service.registerNewUser(userData);
		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(mockCrypt.cryptPassword).toBeCalledTimes(1);
				expect(mockValidator.validatePayload).toBeCalledTimes(1);
				expect(mockEmailValidator.checkIfEmailIsReal).toBeCalledTimes(1);
				expect(mockValidator.handleValidateError).toBeCalledTimes(1);
				expect(UserMongoRepository.registerUser).toBeCalledTimes(1);
				expect(UserMongoRepository.handleRepositoryError).toBeCalledTimes(1);
				expect(UserMongoRepository.handleRepositoryError).toBeCalledWith(testError, customError);
				expect(err.getStatus()).toBe(HttpStatusCode.CONFLICT);
				expect(err.getMessage()).toBe('Repository Error');
			}
		}
	});

	it('Register new user: should throw a internal server error if occur an unknown error', async () => {
		try {
			mockCrypt.cryptPassword = vi.fn().mockImplementation(() => cryptedPassword);	
			mockValidator.validatePayload = vi.fn();
			mockEmailValidator.checkIfEmailIsReal = vi.fn();
			mockValidator.handleValidateError = vi.fn();
			UserMongoRepository.registerUser = vi.fn().mockImplementation(() => {
				throw testError;
			});
			UserMongoRepository.handleRepositoryError = vi.fn();

			await service.registerNewUser(userData);
		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(mockCrypt.cryptPassword).toBeCalledTimes(1);
				expect(mockValidator.validatePayload).toBeCalledTimes(1);
				expect(mockEmailValidator.checkIfEmailIsReal).toBeCalledTimes(1);
				expect(mockValidator.handleValidateError).toBeCalledTimes(1);
				expect(UserMongoRepository.registerUser).toBeCalledTimes(1);
				expect(UserMongoRepository.handleRepositoryError).toBeCalledTimes(1);
				expect(err.getStatus()).toBe(HttpStatusCode.INTERNAL);
				expect(err.getMessage()).toBe('Internal Server Error!');
			}
		}
	});
});
