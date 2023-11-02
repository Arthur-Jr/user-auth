/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, vi, expect, afterEach, beforeEach } from 'vitest';
import { Request, Response } from 'express';

import CustomErrorImp from '../../errors/CustomErrorImp';
import ErrorMessages from '../../enums/ErrorMessages';
import ErrorMiddleware from '../../middlewares/ErrorMiddleware';
import HttpStatusCode from '../../enums/HttpStatusCode';

describe('Middlewares tests:', () => {
	const mockRequest = { body: {} };
	const mockResponse = {
		status: vi.fn().mockImplementation((_x: number) => mockResponse),
		json: vi.fn().mockImplementation((x: unknown) => x),
	} as Partial<Response>;
	const mockNext = vi.fn();
	let customError = new CustomErrorImp();

	beforeEach(() => {
		customError = new CustomErrorImp();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('Error middleware: should return error with status code and right message', () => {
		customError.setStatus(HttpStatusCode.BAD_REQUEST);
		customError.setMessage(ErrorMessages.SHORT_USERNAME);
		ErrorMiddleware.handleCustomError(customError, mockRequest as Request, mockResponse as Response, mockNext);

		expect(mockResponse.status).toBeCalledWith(HttpStatusCode.BAD_REQUEST);
		expect(mockResponse.json).toBeCalledWith({ message: ErrorMessages.SHORT_USERNAME });
	});
});
