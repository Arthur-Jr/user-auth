import { NextFunction, Response } from 'express';

import ExtendedRequest from '../interfaces/ExtendedRequest';
import UserManagerService from '../interfaces/UserManegerService';
import UserManagerServiceImp from '../service/UserManager.service';
import EditUserPayload from '../interfaces/EditUserPayload';
import HttpStatusCode from '../enums/HttpStatusCode';

class UserManagerController {
	private readonly userManagerService: UserManagerService;

	constructor(userManagerService: UserManagerService) {
		this.userManagerService = userManagerService;
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
			const token = await this.userManagerService.addEmailToTestUser(req.body as EditUserPayload);
			return res.status(HttpStatusCode.OK).json(token);
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
}

export default new UserManagerController(UserManagerServiceImp);
