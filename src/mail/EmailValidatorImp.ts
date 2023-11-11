/* eslint-disable no-mixed-spaces-and-tabs */
import ErrorMessages from '../enums/ErrorMessages';
import HttpStatusCode from '../enums/HttpStatusCode';
import CustomError from '../interfaces/CustomError';
import EmailValidator from '../interfaces/EmailValidator';
import fetch from 'node-fetch';

interface ApiResponse {
	deliverability: string,
	error?: unknown,
}

class EmailValidatorImp implements EmailValidator {
	public async checkIfEmailIsReal(email: string, customError: CustomError): Promise<void> {
		const key = process.env.ABSTRACT_API_KEY || '';
		const response = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${key}&email=${email}`);
		const result = await response.json() as ApiResponse;

		if(result.error) {
    	throw new Error();
		}

		if(result.deliverability === 'UNDELIVERABLE') {
    	customError.setMessage(ErrorMessages.UNDELIVERABLE_EMAIL);
    	customError.setStatus(HttpStatusCode.BAD_REQUEST);
    	throw customError;
		}
	}
}

export default EmailValidatorImp;
