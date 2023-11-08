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
			this.userManagerService.editUser(req.body as EditUserPayload);
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
}

export default new UserManagerController(UserManagerServiceImp);
