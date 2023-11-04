import CustomError from '../interfaces/CustomError';
import CustomErrorImp from '../errors/CustomErrorImp';
import PayloadValidator from '../interfaces/PayloadValidator';
import UserService from './User.service';
import UserMongoRepository from '../repository/UserMongo.repository';
import UserRepository from '../interfaces/UserRepository';
import ZodPayloadValidator, { userRegisterSchema } from '../zod/ZodPayloadValidator';
import Auth from '../interfaces/Auth';
import JwtAuth from '../auth/JwtAuth';
import IRegisterService from '../interfaces/IRegisterService';
import Status from '../enums/Status';
import PasswordCrypt from '../interfaces/PasswordCrypt';
import BCryptPassword from '../crypt/BCryptPassword';
import UserPayload from '../interfaces/UserPayload';

export class RegisterService extends UserService implements IRegisterService {
	constructor(
		userRepository: UserRepository,
		payloadValidator: PayloadValidator,
		customError: CustomError,
		auth: Auth,
		crypt: PasswordCrypt,
	) {
		super(userRepository, payloadValidator, customError, auth, crypt);
	}

	public async registerNewUser(userData: UserPayload): Promise<{ token: string }> {
		try {
			this.payloadValidator.validatePayload(userData);
			const accType = userData.email ? Status.VALID_ACC : Status.TEST_ACC;
			const cryptedPassword = await this.crypt.cryptPassword(userData.password);

			const { username } = await this.userRepository.registerUser(
				{
					...userData,
					password: cryptedPassword,
					status: accType
				}
			);
		
			const token = this.auth.getToken({ username, status: accType });
			return { token };
		} catch(err: unknown) {
			this.payloadValidator.handleValidateError(err, this.customError);
			this.userRepository.handleRepositoryError(err, this.customError);
			throw this.customError;
		}
	}
}

export default new RegisterService(
	UserMongoRepository,
	new ZodPayloadValidator(userRegisterSchema),
	new CustomErrorImp(),
	new JwtAuth(),
	new BCryptPassword()
);
