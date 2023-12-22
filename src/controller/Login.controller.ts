import { CookieOptions, NextFunction, Request, Response } from 'express';

import constants from '../constants/constants';
import HttpStatusCode from '../enums/HttpStatusCode';
import LoginService from '../interfaces/LoginService';
import LoginServiceImp from '../service/Login.service';

class LoginController {
	private readonly loginService: LoginService;
	private readonly cookieOptions: CookieOptions;

	constructor(loginService: LoginService, cookieOptions: CookieOptions) {
		this.loginService = loginService;
		this.cookieOptions = cookieOptions;
	}

	public async login(req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
		try {
			const { token } = await this.loginService.login(req.body);

			res.cookie(constants.cookieTokenKeyName, token, this.cookieOptions);
			return res.status(HttpStatusCode.OK).json({ message: 'Login Successful!' });
		} catch(err: unknown) {
			next(err);
		}
	}

	public async logout(_req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
		try {
			res.clearCookie(constants.cookieTokenKeyName);
			return res.status(HttpStatusCode.NO_CONTENT).json();
		} catch(err: unknown) {
			next(err);
		}
	}
}

export default new LoginController(
	LoginServiceImp,
	constants.cookieDefaultSettings,
);
