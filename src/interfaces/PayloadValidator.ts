import CustomError from './CustomError';
import UserLogin from './UserPayload';

interface PayloadValidator {
	handleValidateError(err: unknown, customError: CustomError): void,
	validatePayload(userData: UserLogin): void,
}

export default PayloadValidator;
