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
import Status from '../../enums/Status';
import SendGridMail from '../../mail/SendGridMail';

describe('User manager service tests:', () => {
	const mockValidator = new ZodPayloadValidator(editUserSchema);
	const mockAuth = new JwtAuth();
	const mockCrypt = new BCryptPassword();
	const mockMail = new SendGridMail();
	let customError = new CustomErrorImp();
	let service: UserManagerService;
	const userData = { username: 'test', email: 'test@email.com', password: 'cryptedPassword', status: Status.VALID_ACC };
	const userTestData = { username: 'test', email: 'test@email.com', password: 'cryptedPassword', status: Status.TEST_ACC };
	let editPayload = { username: 'test', password: 'pass', email: '', newPassword: '' };
	const testError = new Error('test Error');
	const cryptedPassword = 'cryptPass';

	beforeEach(() => {
		customError = new CustomErrorImp();
		service = new UserManagerServiceImp(UserMongoRepository, mockValidator, customError, mockAuth, mockCrypt, mockMail);
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
		mockCrypt.cryptPassword = vi.fn().mockImplementation(() => cryptedPassword);
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
		expect(UserMongoRepository.editPassword).toBeCalledWith(editPayload.username, cryptedPassword);
		expect(UserMongoRepository.editEmail).toBeCalledTimes(0);
	});

	it('Edit user: should edit password and email', async () => {
		mockValidator.validatePayload = vi.fn();
		UserMongoRepository.findUserByUsername = vi.fn().mockImplementation(() => userData);
		mockCrypt.checkPassword = vi.fn();
		mockCrypt.cryptPassword = vi.fn().mockImplementation(() => cryptedPassword);
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
		expect(UserMongoRepository.editPassword).toBeCalledWith(editPayload.username, cryptedPassword);
		expect(UserMongoRepository.editEmail).toBeCalledTimes(1);
		expect(UserMongoRepository.editEmail).toBeCalledWith(editPayload.username, editPayload.email);
	});

	it('Edit user: should not edit user data if its a test acc', async () => {
		try {
			mockValidator.validatePayload = vi.fn();
			UserMongoRepository.findUserByUsername = vi.fn().mockImplementation(() => userTestData);
			mockCrypt.checkPassword = vi.fn();
	
			await service.editUser(editPayload);

		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(mockValidator.validatePayload).toBeCalledTimes(1);
				expect(mockValidator.validatePayload).toBeCalledWith(editPayload);
				expect(UserMongoRepository.findUserByUsername).toBeCalledTimes(1);
				expect(UserMongoRepository.findUserByUsername).toBeCalledWith(editPayload.username);
				expect(mockCrypt.checkPassword).toBeCalledTimes(1);
				expect(mockCrypt.checkPassword).toBeCalledWith(editPayload.password, userData.password, customError);
				expect(UserMongoRepository.editPassword).toBeCalledTimes(0);
				expect(UserMongoRepository.editEmail).toBeCalledTimes(0);
			}
		}

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

	it('Add email to test user: should add email if its a test acc', async () => {
		editPayload.email = userTestData.email;
		mockValidator.validatePayload = vi.fn();
		UserMongoRepository.findUserByUsername = vi.fn().mockImplementation(() => userTestData);
		mockCrypt.checkPassword = vi.fn();
		UserMongoRepository.addEmailToTestUser = vi.fn();
		mockAuth.getToken = vi.fn().mockImplementation(() => 'token');
		const token = await service.addEmailToTestUser(editPayload);

		expect(token).toStrictEqual({ token: 'token' });
		expect(mockValidator.validatePayload).toBeCalledTimes(1);
		expect(mockValidator.validatePayload).toBeCalledWith(editPayload);
		expect(UserMongoRepository.findUserByUsername).toBeCalledTimes(1);
		expect(UserMongoRepository.findUserByUsername).toBeCalledWith(editPayload.username);
		expect(mockCrypt.checkPassword).toBeCalledTimes(1);
		expect(mockCrypt.checkPassword).toBeCalledWith(editPayload.password, userData.password, customError);
		expect(UserMongoRepository.addEmailToTestUser).toBeCalledTimes(1);
		expect(UserMongoRepository.addEmailToTestUser).toBeCalledWith(editPayload.username, editPayload.email, Status.VALID_ACC);
	});

	it('Add email to test user: should not add email if its a valid acc', async () => {
		try {
			editPayload.email = userTestData.email;
			mockValidator.validatePayload = vi.fn();
			UserMongoRepository.findUserByUsername = vi.fn().mockImplementation(() => userData);
			mockCrypt.checkPassword = vi.fn();
			UserMongoRepository.addEmailToTestUser = vi.fn();
			mockAuth.getToken = vi.fn().mockImplementation(() => 'token');
			await service.addEmailToTestUser(editPayload);
			
		} catch(err) {
			expect(mockValidator.validatePayload).toBeCalledTimes(1);
			expect(mockValidator.validatePayload).toBeCalledWith(editPayload);
			expect(UserMongoRepository.findUserByUsername).toBeCalledTimes(1);
			expect(UserMongoRepository.findUserByUsername).toBeCalledWith(editPayload.username);
			expect(mockCrypt.checkPassword).toBeCalledTimes(1);
			expect(mockCrypt.checkPassword).toBeCalledWith(editPayload.password, userData.password, customError);
			expect(UserMongoRepository.addEmailToTestUser).toBeCalledTimes(0);

			if(err instanceof CustomErrorImp) {
				expect(err.getStatus()).toBe(HttpStatusCode.BAD_REQUEST);
				expect(err.getMessage()).toBe(`${ErrorMessages.INVALID_EMAIL} or ${ErrorMessages.INVALID_ACC_TYPE}`);
			}
		}
	});

	it('Add email to test user: should throw an Error if payload is invalid', async () => {
		try {
			mockValidator.validatePayload = vi.fn().mockImplementation(() => {
				throw testError;
			});

			mockValidator.handleValidateError = vi.fn().mockImplementation(() => {
				customError.setMessage('Validate Error');
				customError.setStatus(HttpStatusCode.BAD_REQUEST);
				throw customError;
			});

			await service.addEmailToTestUser(editPayload);
		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(mockValidator.validatePayload).toBeCalledTimes(1);
				expect(UserMongoRepository.findUserByUsername).toBeCalledTimes(0);
				expect(UserMongoRepository.addEmailToTestUser).toBeCalledTimes(0);
				expect(mockValidator.handleValidateError).toBeCalledTimes(1);
				expect(mockValidator.handleValidateError).toBeCalledWith(testError, customError);
				expect(err.getStatus()).toBe(HttpStatusCode.BAD_REQUEST);
				expect(err.getMessage()).toBe('Validate Error');
			}
		}
	});

	it('Add email to test user: should throw a custom Error if repository throw error.', async () => {
		try {
			editPayload.email = userData.email;
			mockValidator.validatePayload = vi.fn();
			mockValidator.handleValidateError = vi.fn();
			UserMongoRepository.findUserByUsername = vi.fn().mockImplementation(() => userTestData);
			mockCrypt.checkPassword = vi.fn();
			UserMongoRepository.addEmailToTestUser = vi.fn().mockImplementation(() => {
				throw testError;
			});

			UserMongoRepository.handleRepositoryError = vi.fn().mockImplementation(() => {
				customError.setMessage('Repository Error');
				customError.setStatus(HttpStatusCode.CONFLICT);
				throw customError;
			});

			await service.addEmailToTestUser(editPayload);
		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(mockValidator.validatePayload).toBeCalledTimes(1);
				expect(mockValidator.handleValidateError).toBeCalledTimes(1);
				expect(UserMongoRepository.findUserByUsername).toBeCalledTimes(1);
				expect(UserMongoRepository.addEmailToTestUser).toBeCalledTimes(1);
				expect(UserMongoRepository.handleRepositoryError).toBeCalledTimes(1);
				expect(UserMongoRepository.handleRepositoryError).toBeCalledWith(testError, customError);
				expect(err.getStatus()).toBe(HttpStatusCode.CONFLICT);
				expect(err.getMessage()).toBe('Repository Error');
			}
		}
	});

	it('Get user by username: should return user info', async () => {
		UserMongoRepository.findUserByUsername = vi.fn().mockImplementation(() => userData);
		const user = await service.getUserByUsername(userData.username);
		
		expect(user.username).toBe(userData.username);
		expect(user.status).toBe(userData.status);
		expect(user.email).toBe(userData.email);
		expect(UserMongoRepository.findUserByUsername).toBeCalledTimes(1);
		expect(UserMongoRepository.findUserByUsername).toBeCalledWith(userData.username);
	});

	it('Get user by username: should throw a custom Error if user is not found.', async () => {
		try {
			UserMongoRepository.findUserByUsername = vi.fn().mockImplementation(() => null);
			UserMongoRepository.handleRepositoryError = vi.fn();

			expect(async () => {
				await service.getUserByUsername(userData.username);
			});
		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(UserMongoRepository.findUserByUsername).toBeCalledTimes(1);
				expect(UserMongoRepository.handleRepositoryError).toBeCalledTimes(1);
				expect(err.getStatus()).toBe(HttpStatusCode.NOT_FOUND);
				expect(err.getMessage()).toBe(ErrorMessages.USER_NOT_FOUND);
			}
		}
	});

	it('Get user by username: should throw a custom Error if repository throw error.', async () => {
		try {
			UserMongoRepository.findUserByUsername = vi.fn().mockImplementation(() => {
				throw testError;
			});

			UserMongoRepository.handleRepositoryError = vi.fn().mockImplementation(() => {
				customError.setMessage('Repository Error');
				customError.setStatus(HttpStatusCode.CONFLICT);
				throw customError;
			});

			await service.getUserByUsername(userData.username);
		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(UserMongoRepository.findUserByUsername).toBeCalledTimes(1);
				expect(UserMongoRepository.handleRepositoryError).toBeCalledTimes(1);
				expect(UserMongoRepository.handleRepositoryError).toBeCalledWith(testError, customError);
				expect(err.getStatus()).toBe(HttpStatusCode.CONFLICT);
				expect(err.getMessage()).toBe('Repository Error');
			}
		}
	});

	it('Delete user should delete user', async () => {
		mockValidator.validatePayload = vi.fn();
		mockValidator.handleValidateError = vi.fn();
		UserMongoRepository.findUserByUsername = vi.fn().mockImplementation(() => userData);
		mockCrypt.checkPassword = vi.fn();
		UserMongoRepository.deleteUser = vi.fn().mockImplementation(() => null);
		await service.deleteUser(editPayload);
		
		expect(UserMongoRepository.deleteUser).toBeCalledTimes(1);
		expect(UserMongoRepository.deleteUser).toBeCalledWith(editPayload.username);
	});

	it('Delete user: should throw an Error if payload is invalid', async () => {
		try {
			mockValidator.validatePayload = vi.fn().mockImplementation(() => {
				throw testError;
			});

			mockValidator.handleValidateError = vi.fn().mockImplementation(() => {
				customError.setMessage('Validate Error');
				customError.setStatus(HttpStatusCode.BAD_REQUEST);
				throw customError;
			});

			await service.deleteUser(editPayload);
		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(mockValidator.validatePayload).toBeCalledTimes(1);
				expect(UserMongoRepository.findUserByUsername).toBeCalledTimes(0);
				expect(UserMongoRepository.addEmailToTestUser).toBeCalledTimes(0);
				expect(mockValidator.handleValidateError).toBeCalledTimes(1);
				expect(mockValidator.handleValidateError).toBeCalledWith(testError, customError);
				expect(err.getStatus()).toBe(HttpStatusCode.BAD_REQUEST);
				expect(err.getMessage()).toBe('Validate Error');
			}
		}
	});

	it('Delete user: should throw a custom Error if repository throw error.', async () => {
		try {
			mockValidator.validatePayload = vi.fn();
			mockValidator.handleValidateError = vi.fn();
			UserMongoRepository.findUserByUsername = vi.fn().mockImplementation(() => userData);
			mockCrypt.checkPassword = vi.fn();
			UserMongoRepository.deleteUser = vi.fn().mockImplementation(() => {
				throw testError;
			});

			UserMongoRepository.handleRepositoryError = vi.fn().mockImplementation(() => {
				customError.setMessage('Repository Error');
				customError.setStatus(HttpStatusCode.CONFLICT);
				throw customError;
			});

			await service.deleteUser(editPayload);
		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(UserMongoRepository.findUserByUsername).toBeCalledTimes(1);
				expect(UserMongoRepository.handleRepositoryError).toBeCalledTimes(1);
				expect(UserMongoRepository.handleRepositoryError).toBeCalledWith(testError, customError);
				expect(err.getStatus()).toBe(HttpStatusCode.CONFLICT);
				expect(err.getMessage()).toBe('Repository Error');
			}
		}
	});

	it('Forgot Password: should send an email', async () => {
		mockValidator.validateEmail = vi.fn();
		mockValidator.handleValidateError = vi.fn();
		UserMongoRepository.findUserByEmail = vi.fn().mockImplementation(() => userData);
		mockAuth.getToken = vi.fn().mockImplementation(() => 'token');
		mockMail.sendEmail = vi.fn();

		await service.forgetPassword(userData.email);

		expect(mockValidator.validateEmail).toBeCalledTimes(1);
		expect(mockValidator.validateEmail).toBeCalledWith(userData.email);
		expect(mockAuth.getToken).toBeCalledTimes(1);
		expect(mockAuth.getToken).toBeCalledWith({ username: userData.username, status: userData.status }, '1h');
		expect(mockMail.sendEmail).toBeCalledTimes(1);
		expect(mockMail.sendEmail).toBeCalledWith(userData.email, 'token', customError);
	});

	it('Forgot Password: should throw an error if email is invalid', async () => {
		try {
			mockValidator.validateEmail = vi.fn().mockImplementation(() => {
				throw new Error('test erro');
			});

			mockValidator.handleValidateError = vi.fn().mockImplementation(() => {
				customError.setMessage('Validate Error');
				customError.setStatus(HttpStatusCode.BAD_REQUEST);
				throw customError;
			});
	
			await service.forgetPassword(userData.email);

		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(mockValidator.validateEmail).toBeCalledTimes(1);
				expect(mockValidator.validateEmail).toBeCalledWith(userData.email);
				expect(mockValidator.handleValidateError).toBeCalledTimes(1);
				expect(err.getStatus()).toBe(HttpStatusCode.BAD_REQUEST);
				expect(err.getMessage()).toBe('Validate Error');
			}
		}
	});

	it('Forgot Password: should throw a custom error if repository email throw an error', async () => {
		try {
			mockValidator.validateEmail = vi.fn();
			mockValidator.handleValidateError = vi.fn();
			UserMongoRepository.findUserByEmail = vi.fn().mockImplementation(() => {
				throw new Error('test erro');
			});
			UserMongoRepository.handleRepositoryError = vi.fn().mockImplementation(() => {
				customError.setMessage('Repository Error');
				customError.setStatus(HttpStatusCode.BAD_REQUEST);
				throw customError;
			});
	
			await service.forgetPassword(userData.email);

		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(mockValidator.validateEmail).toBeCalledTimes(1);
				expect(mockValidator.validateEmail).toBeCalledWith(userData.email);
				expect(mockValidator.handleValidateError).toBeCalledTimes(1);
				expect(err.getStatus()).toBe(HttpStatusCode.BAD_REQUEST);
				expect(err.getMessage()).toBe('Repository Error');
			}
		}
	});

	it('Reset Password: should change password', async () => {
		mockValidator.validatePayload = vi.fn();
		mockValidator.handleValidateError = vi.fn();
		UserMongoRepository.editPassword = vi.fn();

		await service.resetPassword(userData);

		expect(mockValidator.validatePayload).toBeCalledTimes(1);
		expect(mockValidator.validatePayload).toBeCalledWith(userData);
		expect(mockValidator.handleValidateError).toBeCalledTimes(0);
		expect(UserMongoRepository.editPassword).toBeCalledTimes(1);
		expect(UserMongoRepository.editPassword).toBeCalledWith(userData.username, userData.password);
	});
});
