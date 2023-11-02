import { NextFunction, Request, Response } from 'express';
import RegisterService from '../service/Register.service';
import IRegisterService from '../interfaces/IRegisterService';
import HttpStatusCode from '../enums/HttpStatusCode';

class RegisterController {
	private userService: IRegisterService;

	constructor(userService: IRegisterService) {
		this.userService = userService;
	}

	public async registerNewUser(req: Request, res: Response, next: NextFunction): Promise<Response | undefined> {
		try {
			const token = await this.userService.registerNewUser(req.body);
			return res.status(HttpStatusCode.CREATED).json(token);
		} catch(err) {
			next(err);
		}
	}
}

export default new RegisterController(RegisterService);
