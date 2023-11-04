import JwtAuth from '../auth/JwtAuth';
import BCryptPassword from '../crypt/BCryptPassword';
import ErrorMessages from '../enums/ErrorMessages';
import HttpStatusCode from '../enums/HttpStatusCode';
import CustomErrorImp from '../errors/CustomErrorImp';
import Auth from '../interfaces/Auth';
import CustomError from '../interfaces/CustomError';
import LoginService from '../interfaces/LoginService';
import PasswordCrypt from '../interfaces/PasswordCrypt';
import PayloadValidator from '../interfaces/PayloadValidator';
import User from '../interfaces/User';
import UserPayload from '../interfaces/UserPayload';
import UserRepository from '../interfaces/UserRepository';
import UserMongoRepository from '../repository/UserMongo.repository';
import ZodPayloadValidator, { userLoginSchema } from '../zod/ZodPayloadValidator';
import UserService from './User.service';

export class LoginServiceImp extends UserService implements LoginService {
	constructor(
		userRepository: UserRepository,
		payloadValidator: PayloadValidator,
		customError: CustomError,
		auth: Auth,
		crypt: PasswordCrypt
	) {
		super(userRepository, payloadValidator, customError, auth, crypt);
	}

	public async login(userData: UserPayload): Promise<{ token: string; }> {
		try {
			this.payloadValidator.validatePayload(userData);
			const { username, status, password } = await this.getUserByUsernameOrEmail(userData);
			await this.crypt.checkPassword(userData.password, password, this.customError);

			const token = this.auth.getToken({ username, status });
			return { token };
		} catch(err: unknown) {
			this.payloadValidator.handleValidateError(err, this.customError);
			this.userRepository.handleRepositoryError(err, this.customError);
			throw this.customError;
		}
	}

	private async getUserByUsernameOrEmail(userData: UserPayload): Promise<User> | never {
		let user: User | null = null;

		if (userData.username) {
			user = await this.userRepository.findUserByUsername(userData.username);
		}

		if (userData.email) {
			user = await this.userRepository.findUserByEmail(userData.email);
		}

		if (!user) {
			this.customError.setMessage(ErrorMessages.USER_NOT_FOUND);
			this.customError.setStatus(HttpStatusCode.NOT_FOUND);
			throw this.customError;
		}

		return user;
	}
}

export default new LoginServiceImp(
	UserMongoRepository,
	new ZodPayloadValidator(userLoginSchema),
	new CustomErrorImp(),
	new JwtAuth(),
	new BCryptPassword()
);
