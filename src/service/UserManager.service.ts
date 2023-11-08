import JwtAuth from '../auth/JwtAuth';
import BCryptPassword from '../crypt/BCryptPassword';
import ErrorMessages from '../enums/ErrorMessages';
import HttpStatusCode from '../enums/HttpStatusCode';
import Status from '../enums/Status';
import CustomErrorImp from '../errors/CustomErrorImp';
import Auth from '../interfaces/Auth';
import CustomError from '../interfaces/CustomError';
import EditUserPayload from '../interfaces/EditUserPayload';
import PasswordCrypt from '../interfaces/PasswordCrypt';
import PayloadValidator from '../interfaces/PayloadValidator';
import User from '../interfaces/User';
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
			await this.checkUser(userPayload.username, userPayload.password);

			if(userPayload.email) {
				await this.userRepository.editEmail(userPayload.username, userPayload.email);
			}

			if(userPayload.newPassword) {
				await this.userRepository.editPassword(userPayload.username, userPayload.newPassword);
			}

		} catch(err) {
			this.payloadValidator.handleValidateError(err, this.customError);
			this.userRepository.handleRepositoryError(err, this.customError);
			throw this.customError;
		}
	}

	public async addEmailToTestUser(userPayload: EditUserPayload): Promise<{ token: string }> | never {
		try {
			this.payloadValidator.validatePayload(userPayload);
			const user = await this.checkUser(userPayload.username, userPayload.password);

			if(userPayload.email && user.status === Status.TEST_ACC) {
				await this.userRepository.addEmailToTestUser(userPayload.username, userPayload.email, Status.VALID_ACC);
			} else {
				this.customError.setMessage(ErrorMessages.INVALID_ACC_TYPE);
				this.customError.setStatus(HttpStatusCode.BAD_REQUEST);
				throw this.customError;
			}

			const newToken = this.auth.getToken({ username: user.username, status: Status.VALID_ACC });
			return { token: newToken };
		} catch(err) {
			this.payloadValidator.handleValidateError(err, this.customError);
			this.userRepository.handleRepositoryError(err, this.customError);
			throw this.customError;
		}
	}

	private async checkUser(username: string, password: string): Promise<User> | never {
		const user = await this.userRepository.findUserByUsername(username);

		if (!user) {
			this.customError.setMessage(ErrorMessages.USER_NOT_FOUND);
			this.customError.setStatus(HttpStatusCode.NOT_FOUND);
			throw this.customError;
		}

		this.crypt.checkPassword(password, user.password, this.customError); /* Password check */

		return user;
	}

}

export default new UserManagerServiceImp(
	UserMongoRepository,
	new ZodPayloadValidator(editUserSchema),
	new CustomErrorImp(),
	new JwtAuth(),
	new BCryptPassword(),
);
