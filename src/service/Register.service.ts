import Auth from '../interfaces/Auth';
import BCryptPassword from '../crypt/BCryptPassword';
import CustomError from '../interfaces/CustomError';
import CustomErrorImp from '../errors/CustomErrorImp';
import EmailValidator from '../interfaces/EmailValidator';
import EmailValidatorImp from '../mail/EmailValidatorImp';
import IRegisterService from '../interfaces/IRegisterService';
import JwtAuth from '../auth/JwtAuth';
import PayloadValidator from '../interfaces/PayloadValidator';
import PasswordCrypt from '../interfaces/PasswordCrypt';
import Status from '../enums/Status';
import UserMongoRepository from '../repository/UserMongo.repository';
import UserPayload from '../interfaces/UserPayload';
import UserRepository from '../interfaces/UserRepository';
import UserService from './User.service';
import ZodPayloadValidator, { userRegisterSchema } from '../zod/ZodPayloadValidator';

export class RegisterService extends UserService implements IRegisterService {
	private readonly emailValidator: EmailValidator;

	constructor(
		userRepository: UserRepository,
		payloadValidator: PayloadValidator,
		customError: CustomError,
		auth: Auth,
		crypt: PasswordCrypt,
		emailValidator: EmailValidator,
	) {
		super(userRepository, payloadValidator, customError, auth, crypt);
		this.emailValidator = emailValidator;
	}

	public async registerNewUser(userData: UserPayload): Promise<{ token: string }> {
		try {
			this.payloadValidator.validatePayload(userData);
			const accType = userData.email ? Status.VALID_ACC : Status.TEST_ACC;
			const cryptedPassword = await this.crypt.cryptPassword(userData.password);
			userData.email && await this.emailValidator.checkIfEmailIsReal(userData.email, this.customError);

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
	new BCryptPassword(),
	new EmailValidatorImp(),
);
