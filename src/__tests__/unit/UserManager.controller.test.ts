/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, vi, expect, afterEach } from 'vitest';
import { NextFunction, Response } from 'express';

import UserManagerController from '../../controller/UserManager.controller';
import UserManagerServiceImp from '../../service/UserManager.service';
import HttpStatusCode from '../../enums/HttpStatusCode';
import CustomErrorImp from '../../errors/CustomErrorImp';
import ExtendedRequest from '../../interfaces/ExtendedRequest';
import Status from '../../enums/Status';

describe('User manager controller tests:', () => {
	const mockRequest = { body: {} };
	const mockResponse = {
		status: vi.fn().mockImplementation((_x: number) => mockResponse),
		json: vi.fn().mockImplementation((x: unknown) => x),
	} as Partial<Response>;
	const mockNext = vi.fn();
	const editPayload = { username: 'test', password: 'pass', email: 'email@eamil.com', newPassword: 'password' };
	const userData = { username: 'test', email: 'test@email.com', password: 'cryptedPassword', status: Status.VALID_ACC };

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('Edit user: should return status 200 if user was edited', async () => {
		UserManagerServiceImp.editUser = vi.fn();
		mockRequest.body = editPayload;
		await UserManagerController.editUser(mockRequest as ExtendedRequest, mockResponse as Response, mockNext as NextFunction);

		expect(UserManagerServiceImp.editUser).toBeCalledTimes(1);
		expect(UserManagerServiceImp.editUser).toBeCalledWith(editPayload);
		expect(mockResponse.status).toBeCalledWith(HttpStatusCode.OK);
		expect(mockResponse.json).toBeCalledTimes(1);
		expect(mockNext).toBeCalledTimes(0);
	});

	it('Edit user: should call nextFunction when service throw an error', async () => {
		const err = new CustomErrorImp('test error', HttpStatusCode.BAD_REQUEST);
		UserManagerServiceImp.editUser = vi.fn().mockImplementation(() => {
			throw err;
		});
		mockRequest.body = editPayload;
		await UserManagerController.editUser(mockRequest as ExtendedRequest, mockResponse as Response, mockNext as NextFunction);

		expect(UserManagerServiceImp.editUser).toBeCalledTimes(1);
		expect(UserManagerServiceImp.editUser).toBeCalledWith(editPayload);
		expect(mockResponse.status).toBeCalledTimes(0);
		expect(mockResponse.json).toBeCalledTimes(0);
		expect(mockNext).toBeCalledTimes(1);
		expect(mockNext).toBeCalledWith(err);
	});

	it('Add email to test user: should return status 200 with a new token if email was added', async () => {
		UserManagerServiceImp.addEmailToTestUser = vi.fn().mockImplementation(() => ({ token: 'token' }));
		mockRequest.body = editPayload;
		await UserManagerController.addEmailToTestUser(mockRequest as ExtendedRequest, mockResponse as Response, mockNext as NextFunction);

		expect(UserManagerServiceImp.addEmailToTestUser).toBeCalledTimes(1);
		expect(UserManagerServiceImp.addEmailToTestUser).toBeCalledWith(editPayload);
		expect(mockResponse.status).toBeCalledWith(HttpStatusCode.OK);
		expect(mockResponse.json).toBeCalledTimes(1);
		expect(mockNext).toBeCalledTimes(0);
	});

	it('Add email to test user: should call nextFunction when service throw an error', async () => {
		const err = new CustomErrorImp('test error', HttpStatusCode.BAD_REQUEST);
		UserManagerServiceImp.addEmailToTestUser = vi.fn().mockImplementation(() => {
			throw err;
		});
		mockRequest.body = editPayload;
		await UserManagerController.addEmailToTestUser(mockRequest as ExtendedRequest, mockResponse as Response, mockNext as NextFunction);

		expect(UserManagerServiceImp.addEmailToTestUser).toBeCalledTimes(1);
		expect(UserManagerServiceImp.addEmailToTestUser).toBeCalledWith(editPayload);
		expect(mockResponse.status).toBeCalledTimes(0);
		expect(mockResponse.json).toBeCalledTimes(0);
		expect(mockNext).toBeCalledTimes(1);
		expect(mockNext).toBeCalledWith(err);
	});

	it('Get user by username: should return status 200 with a new token if email was added', async () => {
		UserManagerServiceImp.getUserByUsername = vi.fn().mockImplementation(() => userData);
		mockRequest.body = editPayload;
		await UserManagerController.getUserByUsername(mockRequest as ExtendedRequest, mockResponse as Response, mockNext as NextFunction);

		expect(UserManagerServiceImp.getUserByUsername).toBeCalledTimes(1);
		expect(UserManagerServiceImp.getUserByUsername).toBeCalledWith(editPayload.username);
		expect(mockResponse.status).toBeCalledWith(HttpStatusCode.OK);
		expect(mockResponse.json).toBeCalledTimes(1);
		expect(mockNext).toBeCalledTimes(0);
	});

	it('Get user by username: should call nextFunction when service throw an error', async () => {
		const err = new CustomErrorImp('test error', HttpStatusCode.BAD_REQUEST);
		UserManagerServiceImp.getUserByUsername = vi.fn().mockImplementation(() => {
			throw err;
		});
		mockRequest.body = editPayload;
		await UserManagerController.getUserByUsername(mockRequest as ExtendedRequest, mockResponse as Response, mockNext as NextFunction);

		expect(UserManagerServiceImp.getUserByUsername).toBeCalledTimes(1);
		expect(UserManagerServiceImp.getUserByUsername).toBeCalledWith(editPayload.username);
		expect(mockResponse.status).toBeCalledTimes(0);
		expect(mockResponse.json).toBeCalledTimes(0);
		expect(mockNext).toBeCalledTimes(1);
		expect(mockNext).toBeCalledWith(err);
	});

	it('Delete user: should return status 204 if user was deleted', async () => {
		UserManagerServiceImp.deleteUser = vi.fn().mockImplementation(() => null);
		mockRequest.body = editPayload;
		await UserManagerController.deleteUser(mockRequest as ExtendedRequest, mockResponse as Response, mockNext as NextFunction);

		expect(UserManagerServiceImp.deleteUser).toBeCalledTimes(1);
		expect(UserManagerServiceImp.deleteUser).toBeCalledWith(editPayload);
		expect(mockResponse.status).toBeCalledWith(HttpStatusCode.NO_CONTENT);
		expect(mockResponse.json).toBeCalledTimes(1);
		expect(mockNext).toBeCalledTimes(0);
	});

	it('Delete user: should call nextFunction when service throw an error', async () => {
		const err = new CustomErrorImp('test error', HttpStatusCode.BAD_REQUEST);
		UserManagerServiceImp.deleteUser = vi.fn().mockImplementation(() => {
			throw err;
		});
		mockRequest.body = editPayload;
		await UserManagerController.deleteUser(mockRequest as ExtendedRequest, mockResponse as Response, mockNext as NextFunction);

		expect(UserManagerServiceImp.deleteUser).toBeCalledTimes(1);
		expect(UserManagerServiceImp.deleteUser).toBeCalledWith(editPayload);
		expect(mockResponse.status).toBeCalledTimes(0);
		expect(mockResponse.json).toBeCalledTimes(0);
		expect(mockNext).toBeCalledTimes(1);
		expect(mockNext).toBeCalledWith(err);
	});

	it('Forget password: should return status 204 if email was sent', async () => {
		UserManagerServiceImp.forgetPassword = vi.fn().mockImplementation(() => null);
		mockRequest.body = editPayload;
		await UserManagerController.forgetPassword(mockRequest as ExtendedRequest, mockResponse as Response, mockNext as NextFunction);

		expect(UserManagerServiceImp.forgetPassword).toBeCalledTimes(1);
		expect(UserManagerServiceImp.forgetPassword).toBeCalledWith(editPayload.email);
		expect(mockResponse.status).toBeCalledWith(HttpStatusCode.NO_CONTENT);
		expect(mockResponse.json).toBeCalledTimes(1);
		expect(mockNext).toBeCalledTimes(0);
	});

	it('Forget password: should call nextFunction when service throw an error', async () => {
		const err = new CustomErrorImp('test error', HttpStatusCode.BAD_REQUEST);
		UserManagerServiceImp.forgetPassword = vi.fn().mockImplementation(() => {
			throw err;
		});
		mockRequest.body = editPayload;
		await UserManagerController.forgetPassword(mockRequest as ExtendedRequest, mockResponse as Response, mockNext as NextFunction);

		expect(UserManagerServiceImp.forgetPassword).toBeCalledTimes(1);
		expect(UserManagerServiceImp.forgetPassword).toBeCalledWith(editPayload.email);
		expect(mockResponse.status).toBeCalledTimes(0);
		expect(mockResponse.json).toBeCalledTimes(0);
		expect(mockNext).toBeCalledTimes(1);
		expect(mockNext).toBeCalledWith(err);
	});
});
