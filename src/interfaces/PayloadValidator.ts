import CustomError from './CustomError';
import User from './User';

interface PayloadValidator {
	handleValidateError(err: unknown, customError: CustomError): void,
	validatePayload(userData: User): void,
}

export default PayloadValidator;
