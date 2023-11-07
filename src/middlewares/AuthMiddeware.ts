import { NextFunction, Response } from 'express';
import JwtAuth from '../auth/JwtAuth';
import Auth from '../interfaces/Auth';
import CustomError from '../interfaces/CustomError';
import CustomErrorImp from '../errors/CustomErrorImp';
import HttpStatusCode from '../enums/HttpStatusCode';
import ExtendedRequest from '../interfaces/ExtendedRequest';
import ErrorMessages from '../enums/ErrorMessages';

interface authPayload {
  data: { username: string, status: number },
  iat: number,
  exp: number
}

export class AuthMiddleware {
	private readonly auth: Auth;
	private readonly customError: CustomError;

	constructor(auth: Auth, customError: CustomError) {
		this.auth = auth;
		this.customError = customError;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public handleAuthMiddleware(req: ExtendedRequest, _res: Response, next: NextFunction): void {
		try {
			const { authorization } = req.headers;
			
			if (!authorization) {
				this.ThrowAuthError();
				throw this.customError;
			}
    
			const { data } = this.auth.decodeToken(authorization) as authPayload;

			if (!data) {
				this.ThrowAuthError();
				throw this.customError;
			}

			req.body.username = data.username;

			next();
		} catch(err) {
			this.ThrowAuthError();
		}
	}

	private ThrowAuthError() {
		this.customError.setMessage(ErrorMessages.INVALID_AUTH);
		this.customError.setStatus(HttpStatusCode.UNAUTHORIZED);
		throw this.customError;
	}
}

export default new AuthMiddleware(new JwtAuth(), new CustomErrorImp());
