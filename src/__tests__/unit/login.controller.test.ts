/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, vi, expect, afterEach } from 'vitest';
import { NextFunction, Request, Response } from 'express';

import LoginController from '../../controller/Login.controller';
import LoginServiceImp from '../../service/Login.service';
import HttpStatusCode from '../../enums/HttpStatusCode';
import CustomErrorImp from '../../errors/CustomErrorImp';

describe('Login controller unit tests:', () => {
	const mockRequest = { body: {} };
	const mockResponse = {
		status: vi.fn().mockImplementation((_x: number) => mockResponse),
		json: vi.fn().mockImplementation((x: unknown) => x),
	} as Partial<Response>;
	const mockNext = vi.fn();

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('Login: should return status 200 and a auth-token', async () => {
		const expectedResponseData =  { token: 'test' };
		LoginServiceImp.login = vi.fn().mockImplementation(() => expectedResponseData);
		await LoginController.login(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

		expect(LoginServiceImp.login).toBeCalledTimes(1);
		expect(LoginServiceImp.login).toBeCalledWith(mockRequest.body);
		expect(mockResponse.status).toBeCalledWith(HttpStatusCode.OK);
		expect(mockResponse.json).toBeCalledWith(expectedResponseData);
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
