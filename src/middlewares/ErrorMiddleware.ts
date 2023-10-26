import { NextFunction, Request, Response } from 'express';
import CustomError from '../interfaces/CustomError';

class ErrorMiddleware {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public handleCustomError(err: CustomError, _req: Request, res: Response, _next: NextFunction) {
		return res.status(err.getStatus()).json({ message: err.getMessage });
	}
}

export default new ErrorMiddleware();
