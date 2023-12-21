import { NextFunction, Response } from 'express';
import JwtAuth from '../auth/JwtAuth';
import ErrorMessages from '../enums/ErrorMessages';
import HttpStatusCode from '../enums/HttpStatusCode';
import CustomErrorImp from '../errors/CustomErrorImp';
import Auth from '../interfaces/Auth';
import CustomError from '../interfaces/CustomError';
import ExtendedRequest from '../interfaces/ExtendedRequest';
import PayloadValidator from '../interfaces/PayloadValidator';
import ZodPayloadValidator, { tokenSchema } from '../zod/ZodPayloadValidator';

interface authPayload {
  data: { username: string, status: number },
  iat: number,
  exp: number
}

interface authResetPayload extends authPayload {
	data: { username: string, status: number, reset?: boolean }
}

export class AuthMiddleware {
	private readonly auth: Auth;
	private readonly customError: CustomError;
	private readonly payloadValidator: PayloadValidator;

	constructor(auth: Auth, customError: CustomError, payloadValidator: PayloadValidator) {
		this.auth = auth;
		this.customError = customError;
		this.payloadValidator = payloadValidator;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public handleAuthMiddleware(req: ExtendedRequest, _res: Response, next: NextFunction): void {
		try {
			const { userToken } = req.cookies;
			
			if (!userToken) {
				this.ThrowAuthError();
				throw this.customError;
			}
    
			const { data } = this.auth.decodeToken(userToken) as authPayload;

			if (!data || !data.username) {
				this.ThrowAuthError();
				throw this.customError;
			}

			this.payloadValidator.validatePayload({ username: data.username });

			req.body.username = data.username;
			next();
		} catch(err) {
			this.payloadValidator.handleValidateError(err, this.customError);
			this.ThrowAuthError();
		}
	}

	public handleResetAuthMiddleware(req: ExtendedRequest, _res: Response, next: NextFunction): void {
		try {
			const { authorization } = req.headers;
			
			if (!authorization) {
				this.ThrowAuthError();
				throw this.customError;
			}
    
			const { data } = this.auth.decodeToken(authorization) as authResetPayload;

			if (!data || !data.username || !data.reset) {
				this.ThrowAuthError();
				throw this.customError;
			}

			this.payloadValidator.validatePayload({ username: data.username });

			req.body.username = data.username;
			next();
		} catch(err) {
			this.payloadValidator.handleValidateError(err, this.customError);
			this.ThrowAuthError();
		}
	}

	private ThrowAuthError() {
		this.customError.setMessage(ErrorMessages.INVALID_AUTH);
		this.customError.setStatus(HttpStatusCode.UNAUTHORIZED);
		throw this.customError;
	}
}

export default new AuthMiddleware(new JwtAuth(), new CustomErrorImp(), new ZodPayloadValidator(tokenSchema));
