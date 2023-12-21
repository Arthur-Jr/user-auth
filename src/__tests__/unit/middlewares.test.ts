/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import JwtAuth from '../../auth/JwtAuth';
import ErrorMessages from '../../enums/ErrorMessages';
import HttpStatusCode from '../../enums/HttpStatusCode';
import CustomErrorImp from '../../errors/CustomErrorImp';
import ExtendedRequest from '../../interfaces/ExtendedRequest';
import { AuthMiddleware } from '../../middlewares/AuthMiddeware';
import ErrorMiddleware from '../../middlewares/ErrorMiddleware';
import ZodPayloadValidator, { tokenSchema } from '../../zod/ZodPayloadValidator';

describe('Middlewares tests:', () => {
	const mockRequest = { body: { username: '' }, cookies: { userToken: 'testToken' } };
	const mockResponse = {
		status: vi.fn().mockImplementation((_x: number) => mockResponse),
		json: vi.fn().mockImplementation((x: unknown) => x),
	} as Partial<Response>;
	const mockNext = vi.fn();
	let customError = new CustomErrorImp();
	const mockAuth = new JwtAuth();
	const mockValidator = new ZodPayloadValidator(tokenSchema);
	const AuthMiddeware = new AuthMiddleware(mockAuth, customError, mockValidator);

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
		mockValidator.validatePayload = vi.fn();
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

	it('Auth middleware: should throw error if cookies.userToken does not exists', () => {
		try {
			mockRequest.cookies.userToken = '';
			AuthMiddeware.handleAuthMiddleware(mockRequest as ExtendedRequest, mockResponse as Response, mockNext);

		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(err.getStatus()).toBe(HttpStatusCode.UNAUTHORIZED);
				expect(err.getMessage()).toBe(ErrorMessages.INVALID_AUTH);
			}
		}
	});

	it('Auth middleware: should throw error if username is invalid', () => {
		try {
			const err = new Error('test error');
			mockAuth.decodeToken = vi.fn().mockImplementation(() => ({ data: { username: 'test' } }));
			mockValidator.validatePayload = vi.fn().mockImplementation(() => {
				throw err;
			});

			mockValidator.handleValidateError = vi.fn().mockImplementation(() => {
				customError.setMessage('Validate Error');
				customError.setStatus(HttpStatusCode.BAD_REQUEST);
				throw customError;
			});
		
			AuthMiddeware.handleAuthMiddleware(mockRequest as ExtendedRequest, mockResponse as Response, mockNext);
		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(err.getStatus()).toBe(HttpStatusCode.BAD_REQUEST);
				expect(err.getMessage()).toBe('Validate Error');
			}
		}
	});
});
