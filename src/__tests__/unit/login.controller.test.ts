/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';

import constants from '../../constants/constants';
import LoginController from '../../controller/Login.controller';
import HttpStatusCode from '../../enums/HttpStatusCode';
import CustomErrorImp from '../../errors/CustomErrorImp';
import LoginServiceImp from '../../service/Login.service';

describe('Login controller unit tests:', () => {
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

	it('Login: should return status 200 and set token on cookie', async () => {
		const expectedResponseData =  { token: 'test' };
		LoginServiceImp.login = vi.fn().mockImplementation(() => expectedResponseData);
		await LoginController.login(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

		expect(LoginServiceImp.login).toBeCalledTimes(1);
		expect(LoginServiceImp.login).toBeCalledWith(mockRequest.body);
		expect(mockResponse.status).toBeCalledWith(HttpStatusCode.OK);
		expect(mockResponse.cookie).toBeCalledTimes(1);
		expect(mockResponse.cookie).toBeCalledWith(constants.cookieTokenKeyName, expectedResponseData.token, constants.cookieDefaultSettings);
		expect(mockNext).toBeCalledTimes(0);
	});

	it('Login: should call nextFunction when service throw an error', async () => {
		const err = new CustomErrorImp('test error', HttpStatusCode.INTERNAL);
		LoginServiceImp.login = vi.fn().mockImplementation(() => {
			throw err;
		});

		await LoginController.login(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

		expect(LoginServiceImp.login).toBeCalledTimes(1);
		expect(LoginServiceImp.login).toBeCalledWith(mockRequest.body);
		expect(mockResponse.status).toBeCalledTimes(0);
		expect(mockResponse.json).toBeCalledTimes(0);
		expect(mockNext).toBeCalledTimes(1);
		expect(mockNext).toBeCalledWith(err);
	});
  
});
