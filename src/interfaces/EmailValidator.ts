import CustomError from './CustomError';

interface EmailValidator {
  checkIfEmailIsReal(email: string, customError: CustomError): Promise<void>
}

export default EmailValidator;
