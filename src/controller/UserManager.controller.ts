import { CookieOptions, NextFunction, Response } from 'express';

import constants from '../constants/constants';
import HttpStatusCode from '../enums/HttpStatusCode';
import EditUserPayload from '../interfaces/EditUserPayload';
import ExtendedRequest from '../interfaces/ExtendedRequest';
import UserManagerService from '../interfaces/UserManegerService';
import UserManagerServiceImp from '../service/UserManager.service';

class UserManagerController {
	private readonly userManagerService: UserManagerService;
	private readonly cookieOptions: CookieOptions;

	constructor(userManagerService: UserManagerService, cookieOptions: CookieOptions) {
		this.userManagerService = userManagerService;
		this.cookieOptions = cookieOptions;
	}
  
	public async editUser(req: ExtendedRequest, res: Response, next: NextFunction): Promise<Response | undefined> {
		try {
			await this.userManagerService.editUser(req.body as EditUserPayload);
			return res.status(HttpStatusCode.OK).json();
		} catch(err) {
			next(err);
		}
	}

	public async addEmailToTestUser(req: ExtendedRequest, res: Response, next: NextFunction): Promise<Response | undefined> {
		try {
			const { token } = await this.userManagerService.addEmailToTestUser(req.body as EditUserPayload);

			res.cookie(constants.cookieTokenKeyName, token, this.cookieOptions);
			return res.status(HttpStatusCode.OK).json({ message: 'Email Added!' });
		} catch(err) {
			next(err);
		}
	}

	public async getUserByUsername(req: ExtendedRequest, res: Response, next: NextFunction): Promise<Response | undefined> {
		try {
			const user = await this.userManagerService.getUserByUsername(req.body.username as string);
			return res.status(HttpStatusCode.OK).json(user);
		} catch(err) {
			next(err);
		}
	}

	public async deleteUser(req: ExtendedRequest, res: Response, next: NextFunction): Promise<Response | undefined> {
		try {
			await this.userManagerService.deleteUser(req.body as EditUserPayload);
			return res.status(HttpStatusCode.NO_CONTENT).json();
		} catch(err) {
			next(err);
		}
	}

	public async forgetPassword(req: ExtendedRequest, res: Response, next: NextFunction): Promise<Response | undefined> {
		try {
			await this.userManagerService.forgetPassword(req.body.email as string);
			return res.status(HttpStatusCode.NO_CONTENT).json();
		} catch(err) {
			next(err);
		}
	}

	public async resetPassword(req: ExtendedRequest, res: Response, next: NextFunction): Promise<Response | undefined> {
		try {
			await this.userManagerService.resetPassword(req.body as EditUserPayload);
			return res.status(HttpStatusCode.NO_CONTENT).json();
		} catch(err) {
			next(err);
		}
	}
}

export default new UserManagerController(UserManagerServiceImp, constants.cookieDefaultSettings);
