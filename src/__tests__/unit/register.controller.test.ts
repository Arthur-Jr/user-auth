/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';

import constants from '../../constants/constants';
import RegisterController from '../../controller/Register.controller';
import HttpStatusCode from '../../enums/HttpStatusCode';
import CustomErrorImp from '../../errors/CustomErrorImp';
import RegisterService from '../../service/Register.service';

describe('Register controller unit tests:', () => {
	const mockRequest = { body: {} };
	const mockResponse = {
		status: vi.fn().mockImplementation((_x: number) => mockResponse),
		json: vi.fn().mockImplementation((x: unknown) => x),
		cookie: vi.fn().mockImplementation((x: unknown, _token: unknown) => x),
	} as Partial<Response>;
	const mockNext = vi.fn();

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('Register new user: should return status 201 and set token on cookie!', async () => {
		const expectedResponseData =  { token: 'test' };
		RegisterService.registerNewUser = vi.fn().mockImplementation(() => (expectedResponseData));
		await RegisterController.registerNewUser(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

		expect(RegisterService.registerNewUser).toBeCalledTimes(1);
		expect(RegisterService.registerNewUser).toBeCalledWith(mockRequest.body);
		expect(mockResponse.status).toBeCalledWith(HttpStatusCode.CREATED);
		expect(mockResponse.cookie).toBeCalledTimes(1);
		expect(mockResponse.cookie).toBeCalledWith(constants.cookieTokenKeyName, expectedResponseData.token, constants.cookieDefaultSettings);
		expect(mockNext).toBeCalledTimes(0);
	});

	it('Register new user: should call nextFunction when service throw an error', async () => {
		const err = new CustomErrorImp('test error', HttpStatusCode.INTERNAL);
		RegisterService.registerNewUser = vi.fn().mockImplementation(() => {
			throw err;
		});

		await RegisterController.registerNewUser(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

		expect(RegisterService.registerNewUser).toBeCalledTimes(1);
		expect(RegisterService.registerNewUser).toBeCalledWith(mockRequest.body);
		expect(mockResponse.status).toBeCalledTimes(0);
		expect(mockResponse.json).toBeCalledTimes(0);
		expect(mockNext).toBeCalledTimes(1);
		expect(mockNext).toBeCalledWith(err);
	});
});
