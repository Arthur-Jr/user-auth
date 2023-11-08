/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, vi, expect, afterEach, beforeEach } from 'vitest';

import CustomErrorImp from '../../errors/CustomErrorImp';
import JwtAuth from '../../auth/JwtAuth';
import HttpStatusCode from '../../enums/HttpStatusCode';
import UserMongoRepository from '../../repository/UserMongo.repository';
import ZodPayloadValidator, { editUserSchema } from '../../zod/ZodPayloadValidator';
import BCryptPassword from '../../crypt/BCryptPassword';
import UserManagerService from '../../interfaces/UserManegerService';
import { UserManagerServiceImp } from '../../service/UserManager.service';
import ErrorMessages from '../../enums/ErrorMessages';

describe('User manager service tests:', () => {
	const mockValidator = new ZodPayloadValidator(editUserSchema);
	const mockAuth = new JwtAuth();
	const mockCrypt = new BCryptPassword();
	let customError = new CustomErrorImp();
	let service: UserManagerService;
	const userData = { username: 'test', email: 'test@email.com', password: 'cryptedPassword' };
	let editPayload = { username: 'test', password: 'pass', email: '', newPassword: '' };
	const testError = new Error('test Error');

	beforeEach(() => {
		customError = new CustomErrorImp();
		service = new UserManagerServiceImp(UserMongoRepository, mockValidator, customError, mockAuth, mockCrypt);
		editPayload = { username: 'test', password: 'testPass', email: '', newPassword: '' };
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('Edit user: should edit email', async () => {
		mockValidator.validatePayload = vi.fn();
		UserMongoRepository.findUserByUsername = vi.fn().mockImplementation(() => userData);
		mockCrypt.checkPassword = vi.fn();
		UserMongoRepository.editEmail = vi.fn();
		UserMongoRepository.editPassword = vi.fn();
		editPayload.email = userData.email;
		await service.editUser(editPayload);

		expect(mockValidator.validatePayload).toBeCalledTimes(1);
		expect(mockValidator.validatePayload).toBeCalledWith(editPayload);
		expect(UserMongoRepository.findUserByUsername).toBeCalledTimes(1);
		expect(UserMongoRepository.findUserByUsername).toBeCalledWith(editPayload.username);
		expect(mockCrypt.checkPassword).toBeCalledTimes(1);
		expect(mockCrypt.checkPassword).toBeCalledWith(editPayload.password, userData.password, customError);
		expect(UserMongoRepository.editEmail).toBeCalledTimes(1);
		expect(UserMongoRepository.editEmail).toBeCalledWith(editPayload.username, editPayload.email);
		expect(UserMongoRepository.editPassword).toBeCalledTimes(0);
	});

	it('Edit user: should edit password', async () => {
		mockValidator.validatePayload = vi.fn();
		UserMongoRepository.findUserByUsername = vi.fn().mockImplementation(() => userData);
		mockCrypt.checkPassword = vi.fn();
		UserMongoRepository.editEmail = vi.fn();
		UserMongoRepository.editPassword = vi.fn();
		editPayload.newPassword= 'newPass';
		await service.editUser(editPayload);

		expect(mockValidator.validatePayload).toBeCalledTimes(1);
		expect(mockValidator.validatePayload).toBeCalledWith(editPayload);
		expect(UserMongoRepository.findUserByUsername).toBeCalledTimes(1);
		expect(UserMongoRepository.findUserByUsername).toBeCalledWith(editPayload.username);
		expect(mockCrypt.checkPassword).toBeCalledTimes(1);
		expect(mockCrypt.checkPassword).toBeCalledWith(editPayload.password, userData.password, customError);
		expect(UserMongoRepository.editPassword).toBeCalledTimes(1);
		expect(UserMongoRepository.editPassword).toBeCalledWith(editPayload.username, editPayload.newPassword);
		expect(UserMongoRepository.editEmail).toBeCalledTimes(0);
	});

	it('Edit user: should edit password and email', async () => {
		mockValidator.validatePayload = vi.fn();
		UserMongoRepository.findUserByUsername = vi.fn().mockImplementation(() => userData);
		mockCrypt.checkPassword = vi.fn();
		UserMongoRepository.editEmail = vi.fn();
		UserMongoRepository.editPassword = vi.fn();
		editPayload.email = userData.email;
		editPayload.newPassword= 'newPass';
		await service.editUser(editPayload);

		expect(mockValidator.validatePayload).toBeCalledTimes(1);
		expect(mockValidator.validatePayload).toBeCalledWith(editPayload);
		expect(UserMongoRepository.findUserByUsername).toBeCalledTimes(1);
		expect(UserMongoRepository.findUserByUsername).toBeCalledWith(editPayload.username);
		expect(mockCrypt.checkPassword).toBeCalledTimes(1);
		expect(mockCrypt.checkPassword).toBeCalledWith(editPayload.password, userData.password, customError);
		expect(UserMongoRepository.editPassword).toBeCalledTimes(1);
		expect(UserMongoRepository.editPassword).toBeCalledWith(editPayload.username, editPayload.newPassword);
		expect(UserMongoRepository.editEmail).toBeCalledTimes(1);
		expect(UserMongoRepository.editEmail).toBeCalledWith(editPayload.username, editPayload.email);
	});

	it('Edit user: should throw an Error if payload is invalid', async () => {
		try {
			mockValidator.validatePayload = vi.fn().mockImplementation(() => {
				throw testError;
			});

			mockValidator.handleValidateError = vi.fn().mockImplementation(() => {
				customError.setMessage('Validate Error');
				customError.setStatus(HttpStatusCode.BAD_REQUEST);
				throw customError;
			});

			await service.editUser(editPayload);
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

	it('Edit user: should throw a custom Error if repository throw error.', async () => {
		try {
			editPayload.email = userData.email;
			mockValidator.validatePayload = vi.fn();
			mockValidator.handleValidateError = vi.fn();
			UserMongoRepository.findUserByUsername = vi.fn().mockImplementation(() => userData);
			mockCrypt.checkPassword = vi.fn();
			UserMongoRepository.editEmail = vi.fn().mockImplementation(() => {
				throw testError;
			});

			UserMongoRepository.handleRepositoryError = vi.fn().mockImplementation(() => {
				customError.setMessage('Repository Error');
				customError.setStatus(HttpStatusCode.CONFLICT);
				throw customError;
			});

			await service.editUser(editPayload);
		} catch(err) {
			console.log(err);
			if (err instanceof CustomErrorImp) {
				expect(mockValidator.validatePayload).toBeCalledTimes(1);
				expect(mockValidator.handleValidateError).toBeCalledTimes(1);
				expect(UserMongoRepository.findUserByUsername).toBeCalledTimes(1);
				expect(UserMongoRepository.editEmail).toBeCalledTimes(1);
				expect(UserMongoRepository.handleRepositoryError).toBeCalledTimes(1);
				expect(UserMongoRepository.handleRepositoryError).toBeCalledWith(testError, customError);
				expect(err.getStatus()).toBe(HttpStatusCode.CONFLICT);
				expect(err.getMessage()).toBe('Repository Error');
			}
		}
	});

	it('Edit user: should throw a custom Error if user is not found.', async () => {
		try {
			editPayload.email = userData.email;
			mockValidator.validatePayload = vi.fn();
			mockValidator.handleValidateError = vi.fn();
			UserMongoRepository.findUserByUsername = vi.fn().mockImplementation(() => null);
			UserMongoRepository.handleRepositoryError = vi.fn();

			expect(async () => {
				await service.editUser(editPayload);
			});
		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(mockValidator.validatePayload).toBeCalledTimes(1);
				expect(mockValidator.handleValidateError).toBeCalledTimes(1);
				expect(UserMongoRepository.findUserByUsername).toBeCalledTimes(1);
				expect(UserMongoRepository.editEmail).toBeCalledTimes(1);
				expect(UserMongoRepository.handleRepositoryError).toBeCalledTimes(1);
				expect(mockCrypt.checkPassword).toBeCalledTimes(0);
				expect(err.getStatus()).toBe(HttpStatusCode.NOT_FOUND);
				expect(err.getMessage()).toBe(ErrorMessages.USER_NOT_FOUND);
			}
		}
	});
});
