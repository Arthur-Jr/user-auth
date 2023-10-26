import { NextFunction, Request, Response } from 'express';
import CustomError from '../interfaces/CustomError';
import HttpStatusCode from '../enums/HttpStatusCode';
import ErrorMessages from '../enums/ErrorMessages';

class ErrorMiddleware {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public handleCustomError(err: CustomError, _req: Request, res: Response, _next: NextFunction) {
		if (err.getStatus()) {
			return res.status(err.getStatus()).json({ message: err.getMessage() });
		}

		return res.status(HttpStatusCode.INTERNAL).json({ message: ErrorMessages.INTERNAL_SERVER_ERROR });
	}
}

export default new ErrorMiddleware();
