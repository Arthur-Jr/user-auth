
import CustomError from '../interfaces/CustomError';
import PayloadValidator from '../interfaces/PayloadValidator';
import UserRepository from '../interfaces/UserRepository';

abstract class UserService {
	protected readonly userRepository: UserRepository;
	protected readonly payloadValidator: PayloadValidator;
	protected readonly customError: CustomError;

	constructor(userRepository: UserRepository, payloadValidator: PayloadValidator, customError: CustomError) {
		this.userRepository = userRepository;
		this.payloadValidator = payloadValidator;
		this.customError = customError;
	} 
}

export default UserService;
