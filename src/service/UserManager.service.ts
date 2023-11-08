import JwtAuth from '../auth/JwtAuth';
import BCryptPassword from '../crypt/BCryptPassword';
import ErrorMessages from '../enums/ErrorMessages';
import HttpStatusCode from '../enums/HttpStatusCode';
import CustomErrorImp from '../errors/CustomErrorImp';
import Auth from '../interfaces/Auth';
import CustomError from '../interfaces/CustomError';
import EditUserPayload from '../interfaces/EditUserPayload';
import PasswordCrypt from '../interfaces/PasswordCrypt';
import PayloadValidator from '../interfaces/PayloadValidator';
import UserManagerService from '../interfaces/UserManegerService';
import UserRepository from '../interfaces/UserRepository';
import UserMongoRepository from '../repository/UserMongo.repository';
import ZodPayloadValidator, { editUserSchema } from '../zod/ZodPayloadValidator';
import UserService from './User.service';

export class UserManagerServiceImp extends UserService implements UserManagerService {
	constructor(
		userRepository: UserRepository,
		payloadValidator: PayloadValidator,
		customError: CustomError,
		auth: Auth,
		crypt: PasswordCrypt
	) {
		super(userRepository, payloadValidator, customError, auth, crypt);
	}

	public async editUser(userPayload: EditUserPayload): Promise<void> {
		try {
			this.payloadValidator.validatePayload(userPayload);
			this.checkUser(userPayload.username, userPayload.password);

			if(userPayload.email) {
				this.userRepository.editEmail(userPayload.username, userPayload.email);
			}

			if(userPayload.newPassword) {
				this.userRepository.editPassword(userPayload.username, userPayload.newPassword);
			}

		} catch(err) {
			this.payloadValidator.handleValidateError(err, this.customError);
			this.userRepository.handleRepositoryError(err, this.customError);
			throw this.customError;
		}
	}

	private async checkUser(username: string, password: string): Promise<void> {
		const user = await this.userRepository.findUserByUsername(username);

		if (!user) {
			this.customError.setMessage(ErrorMessages.USER_NOT_FOUND);
			this.customError.setStatus(HttpStatusCode.NOT_FOUND);
			throw this.customError;
		}

		this.crypt.checkPassword(password, user.password, this.customError); /* Password check */
	}

}

export default new UserManagerServiceImp(
	UserMongoRepository,
	new ZodPayloadValidator(editUserSchema),
	new CustomErrorImp(),
	new JwtAuth(),
	new BCryptPassword(),
);
