import { z, ZodObject, ZodRawShape, ZodError } from 'zod';

import CustomError from '../interfaces/CustomError';
import ErrorMessages from '../enums/ErrorMessages';
import HttpStatusCode from '../enums/HttpStatusCode';
import PayloadValidator from '../interfaces/PayloadValidator';
import User from '../interfaces/User';

class ZodPayloadValidator implements PayloadValidator {
	private readonly schema: ZodObject<ZodRawShape>;
	public readonly errorType = ZodError.name;
	
	constructor(schema: ZodObject<ZodRawShape>) {
		this.schema = schema;
	}

	public validatePayload(userData: User): void{
		this.schema.parse(userData);
	}

	public handleValidateError(err: unknown, customError: CustomError): void {
		if (err instanceof ZodError) {
			customError.setMessage(err.issues[0].message);
			customError.setStatus(HttpStatusCode.BAD_REQUEST);
			throw customError;
		}
	}
}

export const userRegisterSchema = z.object({
	username: z.string().min(3, { message: ErrorMessages.SHORT_USERNAME }),
	email: z.string().email(),
	password: z.string().min(6, { message: ErrorMessages.SHORT_PASSWORD }),
});

export default ZodPayloadValidator;
