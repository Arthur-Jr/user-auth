import { CookieOptions, NextFunction, Request, Response } from 'express';
import constants from '../constants/constants';
import HttpStatusCode from '../enums/HttpStatusCode';
import IRegisterService from '../interfaces/IRegisterService';
import RegisterService from '../service/Register.service';

class RegisterController {
	private userService: IRegisterService;
	private readonly cookieOptions: CookieOptions;

	constructor(userService: IRegisterService, cookieOptions: CookieOptions) {
		this.userService = userService;
		this.cookieOptions = cookieOptions;
	}

	public async registerNewUser(req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
		try {
			const { token } = await this.userService.registerNewUser(req.body);

			res.cookie(constants.cookieTokenKeyName, token, this.cookieOptions);
			return res.status(HttpStatusCode.CREATED).json({ message: 'Register Successful!' });
		} catch(err) {
			next(err);
		}
	}
}

export default new RegisterController(RegisterService, constants.cookieDefaultSettings);
