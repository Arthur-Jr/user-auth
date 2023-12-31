import CustomError from './CustomError';
import EditUserPayload from './EditUserPayload';
import TokenPayload from './TokenPayload';
import UserLogin from './UserPayload';

interface PayloadValidator {
	handleValidateError(err: unknown, customError: CustomError): void,
	validatePayload(userData: UserLogin | EditUserPayload | TokenPayload): void,
	validateEmail(email: string): void,
	validatePassword(password: string): void,
}

export default PayloadValidator;
