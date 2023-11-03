import CustomError from './CustomError';

interface PasswordCrypt {
  cryptPassword(password: string): Promise<string> | string,
  checkPassword(password: string, cryptPassword: string, cutomError: CustomError): Promise<void> | void,
}

export default PasswordCrypt;
