import bcrypt from 'bcrypt';

import PasswordCrypt from '../interfaces/PasswordCrypt';
import CustomError from '../interfaces/CustomError';
import ErrorMessages from '../enums/ErrorMessages';
import HttpStatusCode from '../enums/HttpStatusCode';

class BCryptPassword implements PasswordCrypt {
	public async cryptPassword(password: string): Promise<string> {
		const salt = await bcrypt.genSalt();
		return bcrypt.hash(password, salt); 
	}

	public async checkPassword(password: string, cryptPassword: string, customError: CustomError): Promise<void> {
		const cryptCheck = await bcrypt.compare(password, cryptPassword);

		if(!cryptCheck) {
			customError.setMessage(ErrorMessages.INVALID_DATA_LOGIN);
			customError.setStatus(HttpStatusCode.UNAUTHORIZED);
			throw customError;
		}
	}  
}

export default BCryptPassword;
