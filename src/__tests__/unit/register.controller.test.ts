/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, vi, expect, afterEach } from 'vitest';
import { NextFunction, Request, Response } from 'express';

import RegisterController from '../../controller/Register.controller';
import RegisterService from '../../service/Register.service';
import HttpStatusCode from '../../enums/HttpStatusCode';
import CustomErrorImp from '../../errors/CustomErrorImp';

describe('Register controller unit tests:', () => {
	const mockRequest = { body: {} };
	const mockResponse = {
		status: vi.fn().mockImplementation((_x: number) => mockResponse),
		json: vi.fn().mockImplementation((x: unknown) => x),
	} as Partial<Response>;
	const mockNext = vi.fn();

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('Register new user: should return status 201 and a auth-token!', async () => {
		const expectedResponseData =  { token: 'test' };
		RegisterService.registerNewUser = vi.fn().mockImplementation(() => (expectedResponseData));
		await RegisterController.registerNewUser(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

		expect(RegisterService.registerNewUser).toBeCalledTimes(1);
		expect(RegisterService.registerNewUser).toBeCalledWith(mockRequest.body);
		expect(mockResponse.status).toBeCalledWith(HttpStatusCode.CREATED);
		expect(mockResponse.json).toBeCalledWith(expectedResponseData);
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
