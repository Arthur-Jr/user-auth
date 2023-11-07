/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, vi, expect, afterEach, beforeEach } from 'vitest';
import { Request, Response } from 'express';

import CustomErrorImp from '../../errors/CustomErrorImp';
import ErrorMessages from '../../enums/ErrorMessages';
import ErrorMiddleware from '../../middlewares/ErrorMiddleware';
import HttpStatusCode from '../../enums/HttpStatusCode';
import { AuthMiddleware } from '../../middlewares/AuthMiddeware';
import JwtAuth from '../../auth/JwtAuth';
import ExtendedRequest from '../../interfaces/ExtendedRequest';

describe('Middlewares tests:', () => {
	const mockRequest = { body: { username: '' }, headers: { authorization: 'testToken' } };
	const mockResponse = {
		status: vi.fn().mockImplementation((_x: number) => mockResponse),
		json: vi.fn().mockImplementation((x: unknown) => x),
	} as Partial<Response>;
	const mockNext = vi.fn();
	let customError = new CustomErrorImp();
	const mockAuth = new JwtAuth();
	const AuthMiddeware = new AuthMiddleware(mockAuth, customError);

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

	it('Auth middleware: should call nextFunction if token is valid', () => {
		mockAuth.decodeToken = vi.fn().mockImplementation(() => ({ data: { username: 'test' } }));
		AuthMiddeware.handleAuthMiddleware(mockRequest as ExtendedRequest, mockResponse as Response, mockNext);

		expect(mockRequest.body.username).toBe('test');
		expect(mockNext).toBeCalledTimes(1);
	});

	it('Auth middleware: should throw error if decodeToken dont return user data', () => {
		try {
			mockAuth.decodeToken = vi.fn().mockImplementation(() => null);
			AuthMiddeware.handleAuthMiddleware(mockRequest as ExtendedRequest, mockResponse as Response, mockNext);
	
		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(err.getStatus()).toBe(HttpStatusCode.UNAUTHORIZED);
				expect(err.getMessage()).toBe(ErrorMessages.INVALID_AUTH);
			}
		}
	});

	it('Auth middleware: should throw error if header.authorization does not exists', () => {
		try {
			mockRequest.headers.authorization = '';
			AuthMiddeware.handleAuthMiddleware(mockRequest as ExtendedRequest, mockResponse as Response, mockNext);
	
		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(err.getStatus()).toBe(HttpStatusCode.UNAUTHORIZED);
				expect(err.getMessage()).toBe(ErrorMessages.INVALID_AUTH);
			}
		}
	});
});
