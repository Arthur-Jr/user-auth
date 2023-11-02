import { describe, it,  expect, beforeEach } from 'vitest';
import { ZodError, ZodIssue } from 'zod';

import CustomErrorImp from '../../errors/CustomErrorImp';
import HttpStatusCode from '../../enums/HttpStatusCode';
import ZodPayloadValidator, { userRegisterSchema } from '../../zod/ZodPayloadValidator';

describe('Validator tests', () => {
	const validator = new ZodPayloadValidator(userRegisterSchema);
	let customError = new CustomErrorImp();

	beforeEach(() => {
		customError = new CustomErrorImp();
	});

	it('Handle validator error: should throw a custom error if its a ZodError', () => {
		try {
			const err = new ZodError([{ message: 'test'} as ZodIssue ]);
    
			validator.handleValidateError(err, customError);
		} catch(err) {
			if(err instanceof CustomErrorImp) {
				expect(err.getStatus()).toBe(HttpStatusCode.BAD_REQUEST);
				expect(err.getMessage()).toBe('test');
			}
		}
	});

	it('Handle validator error: should not throw a error if its not a zodError', () => {
		const err = new Error('test');
		expect(() => {
			validator.handleValidateError(err, customError);
		}).not.toThrowError();
	});
});
