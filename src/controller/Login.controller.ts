import { NextFunction, Request, Response } from 'express';

import LoginService from '../interfaces/LoginService';
import HttpStatusCode from '../enums/HttpStatusCode';
import LoginServiceImp from '../service/Login.service';

class LoginController {
	private readonly loginService: LoginService;

	constructor(loginService: LoginService) {
		this.loginService = loginService;
	}

	public async login(req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
		try {
			const token = this.loginService.login(req.body);
			return res.status(HttpStatusCode.OK).json(token);
		} catch(err: unknown) {
			next(err); 
		}
	}
}

export default new LoginController(LoginServiceImp);
