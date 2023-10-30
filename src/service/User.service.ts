
import Auth from '../interfaces/Auth';
import CustomError from '../interfaces/CustomError';
import PayloadValidator from '../interfaces/PayloadValidator';
import UserRepository from '../interfaces/UserRepository';

abstract class UserService {
	protected readonly userRepository: UserRepository;
	protected readonly payloadValidator: PayloadValidator;
	protected readonly customError: CustomError;
	protected readonly auth: Auth;

	constructor(
		userRepository: UserRepository,
		payloadValidator: PayloadValidator,
		customError: CustomError,
		auth: Auth,
	) {
		this.userRepository = userRepository;
		this.payloadValidator = payloadValidator;
		this.customError = customError;
		this.auth = auth;
	} 
}

export default UserService;
