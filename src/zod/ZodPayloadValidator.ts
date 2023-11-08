import { z, ZodObject, ZodRawShape, ZodError } from 'zod';

import CustomError from '../interfaces/CustomError';
import ErrorMessages from '../enums/ErrorMessages';
import HttpStatusCode from '../enums/HttpStatusCode';
import PayloadValidator from '../interfaces/PayloadValidator';
import UserPayload from '../interfaces/UserPayload';
import EditUserPayload from '../interfaces/EditUserPayload';
import TokenPayload from '../interfaces/TokenPayload';

class ZodPayloadValidator implements PayloadValidator {
	private readonly schema: ZodObject<ZodRawShape>;
	public readonly errorType = ZodError.name;
	
	constructor(schema: ZodObject<ZodRawShape>) {
		this.schema = schema;
	}

	public validatePayload(userData: UserPayload | EditUserPayload| TokenPayload): void{
		this.schema.parse(userData);
	}

	public handleValidateError(err: unknown, customError: CustomError): void {
		if (err instanceof ZodError) {
			switch(err.issues[0].code) {
			case 'invalid_type':
				customError.setMessage(err.issues[0].path[0] + ' is ' + err.issues[0].message + '!');
				break;
			default:
				customError.setMessage(err.issues[0].message);
			}

			customError.setStatus(HttpStatusCode.BAD_REQUEST);
			throw customError;
		}
	}
}

const alphaNumRegex = /^[a-zA-Z0-9_]+$/;

export const userRegisterSchema = z.object({
	username: z.string().min(3, { message: ErrorMessages.SHORT_USERNAME })
		.refine((value) => alphaNumRegex.test(value), { message: ErrorMessages.INVALID_USERNAME }),
	email: z.string().email(),
	password: z.string().min(6, { message: ErrorMessages.SHORT_PASSWORD })
		.refine((value) => alphaNumRegex.test(value), { message: ErrorMessages.INVALID_PASSWORD }),
}).partial({ email: true }).required({ username: true, password: true });

export const userLoginSchema = z.object({
	username: z.string().min(3, { message: ErrorMessages.SHORT_USERNAME })
		.refine((value) => alphaNumRegex.test(value), { message: ErrorMessages.INVALID_USERNAME }),
	email: z.string().email(),
	password: z.string().min(6, { message: ErrorMessages.SHORT_PASSWORD })
		.refine((value) => alphaNumRegex.test(value), { message: ErrorMessages.INVALID_PASSWORD }),
}).partial({ email: true, username: true }).required({ password: true });

export const editUserSchema = z.object({
	username: z.string().min(3, { message: ErrorMessages.SHORT_USERNAME })
		.refine((value) => alphaNumRegex.test(value), { message: ErrorMessages.INVALID_USERNAME }),
	email: z.string().email(),
	password: z.string().min(6, { message: ErrorMessages.SHORT_PASSWORD })
		.refine((value) => alphaNumRegex.test(value), { message: ErrorMessages.INVALID_PASSWORD }),
	newPassword: z.string().min(6, { message: ErrorMessages.SHORT_PASSWORD })
		.refine((value) => alphaNumRegex.test(value), { message: ErrorMessages.INVALID_PASSWORD }),
}).partial({ email: true, newPassword: true }).required({ username: true, password: true });

export const tokenSchema = z.object({
	username: z.string().min(3, { message: ErrorMessages.SHORT_USERNAME })
		.refine((value) => alphaNumRegex.test(value), { message: ErrorMessages.INVALID_USERNAME }),
}).required({ username: true });

export default ZodPayloadValidator;
