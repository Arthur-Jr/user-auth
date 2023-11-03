
import Auth from '../interfaces/Auth';
import CustomError from '../interfaces/CustomError';
import PasswordCrypt from '../interfaces/PasswordCrypt';
import PayloadValidator from '../interfaces/PayloadValidator';
import UserRepository from '../interfaces/UserRepository';

abstract class UserService {
	protected readonly userRepository: UserRepository;
	protected readonly payloadValidator: PayloadValidator;
	protected readonly customError: CustomError;
	protected readonly auth: Auth;
	protected readonly crypt: PasswordCrypt;

	constructor(
		userRepository: UserRepository,
		payloadValidator: PayloadValidator,
		customError: CustomError,
		auth: Auth,
		crypt: PasswordCrypt,
	) {
		this.userRepository = userRepository;
		this.payloadValidator = payloadValidator;
		this.customError = customError;
		this.auth = auth;
		this.crypt = crypt;
	} 
}

export default UserService;
