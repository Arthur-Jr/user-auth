import CustomError from './CustomError';

interface Mail {
  sendEmail(email: string, token: string, customError: CustomError): Promise<void>,
}

export default Mail;
