import sgMail from '@sendgrid/mail';
import CustomError from '../interfaces/CustomError';
import ErrorMessages from '../enums/ErrorMessages';
import HttpStatusCode from '../enums/HttpStatusCode';
import Mail from '../interfaces/Mail';

class SendGridMail implements Mail {
	private readonly API_KEY: string = process.env.SG_API_KEY || '';
	private readonly EMAIL: string = process.env.MY_EMAIL || '';
	private readonly FRONT_URL: string = process.env.FRONT_URL || '';
  
	public async sendEmail(email: string, token: string, customError: CustomError): Promise<void> {
		sgMail.setApiKey(this.API_KEY);

		const msg = {
			to: email,
			from: this.EMAIL,
			subject: 'Forgot Password',
			text: 'Reset your password',
			html: `
			Hello ${email},
			<br />
			<br />

			A request has been received to change the password for your account on my user hub.
			<br />
			If you did not initiate this request, ignore this email.
			<br />
			<br />
			<br />

			<a href="${this.FRONT_URL}/reset/${token}"><strong>RESET PASSWORD</strong></a>!
			<br />
			<br />
			<br />

			<strong>Do not reply this email!</strong>
			`,
		};

		try {
			await sgMail.send(msg);
		} catch(err) {
			customError.setMessage(ErrorMessages.SOMETHING_WENT_WRONG);
			customError.setStatus(HttpStatusCode.BAD_REQUEST);
			throw customError;
		}
	}
}

export default SendGridMail;
