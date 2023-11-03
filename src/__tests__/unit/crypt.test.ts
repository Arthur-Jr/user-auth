import bcrypt from 'bcrypt';
import { describe, it,  expect, afterEach, vi } from 'vitest';

import BCryptPassword from '../../crypt/BCryptPassword';
import CustomErrorImp from '../../errors/CustomErrorImp';
import HttpStatusCode from '../../enums/HttpStatusCode';
import ErrorMessages from '../../enums/ErrorMessages';

describe('Crypt tests:', () => {
	const crypt = new BCryptPassword();
	const customError = new CustomErrorImp();

	afterEach(() => {
		vi.clearAllMocks();
	});
  
	it('Crypt Password test: should return the cryptedPassword', async () => {
		vi.spyOn(bcrypt, 'genSalt').mockImplementation(() => 'salt');
		vi.spyOn(bcrypt, 'hash').mockImplementation(() => 'cryptedPassword');
		const result = await crypt.cryptPassword('password');

		expect(result).toBe('cryptedPassword');
		expect(bcrypt.genSalt).toBeCalledTimes(1);
		expect(bcrypt.hash).toBeCalledTimes(1);
		expect(bcrypt.hash).toBeCalledWith('password', 'salt');
	});

	it('CheckPassword tests: should not throw error if password is correct', async () => {
		vi.spyOn(bcrypt, 'compare').mockImplementation(() => true);

		expect( async() => {
			await crypt.checkPassword('password', 'cryptedPassword', customError);
		}).not.toThrowError();
	});

	it('CheckPassword tests: should throw error if password is incorrect', async () => {
		try {
			vi.spyOn(bcrypt, 'compare').mockImplementation(() => false);
			await crypt.checkPassword('password', 'cryptedPassword', customError);
		} catch(err) {
			expect(err).toBeInstanceOf(CustomErrorImp);
			if(err instanceof CustomErrorImp) {
				expect(err.getStatus()).toBe(HttpStatusCode.UNAUTHORIZED);
				expect(err.getMessage()).toBe(ErrorMessages.INVALID_DATA_LOGIN);
			}
		}

	});
});
