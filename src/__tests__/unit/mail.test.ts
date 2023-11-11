import { describe, it,  expect, afterEach, vi } from 'vitest';
import sgMail from '@sendgrid/mail';

import CustomErrorImp from '../../errors/CustomErrorImp';
import SendGridMail from '../../mail/SendGridMail';
import HttpStatusCode from '../../enums/HttpStatusCode';
import ErrorMessages from '../../enums/ErrorMessages';

describe('Mail tests: ', () => {
	const customError = new CustomErrorImp();
	const mail = new SendGridMail();
	const email = 'email@email.com';
	const token = 'token';

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('Send email: should send email', async () => {
		vi.spyOn(sgMail, 'setApiKey').mockResolvedValue();
		vi.spyOn(sgMail, 'send').mockResolvedValue([]);

		await mail.sendEmail(email, token, customError);

		expect(sgMail.send).toBeCalledTimes(1);
		expect(sgMail.setApiKey).toBeCalledTimes(1);
		expect(customError.getStatus()).toBe(HttpStatusCode.INTERNAL);
	});

	it('Send email: should throw an erro if sgMail throw an error', async () => {
		try {
			vi.spyOn(sgMail, 'setApiKey').mockResolvedValue();
			vi.spyOn(sgMail, 'send').mockImplementation(() => {
				throw new Error('test error');
			});
  
			await mail.sendEmail(email, token, customError);

		} catch(err) {
			if (err instanceof CustomErrorImp) {
				expect(sgMail.send).toBeCalledTimes(1);
				expect(sgMail.setApiKey).toBeCalledTimes(1);
				expect(err.getStatus()).toBe(HttpStatusCode.BAD_REQUEST);
				expect(err.getMessage()).toBe(ErrorMessages.SOMETHING_WENT_WRONG);
			}
		}
	});
});
