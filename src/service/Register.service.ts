import CustomError from '../interfaces/CustomError';
import CustomErrorImp from '../errors/CustomErrorImp';
import PayloadValidator from '../interfaces/PayloadValidator';
import User from '../interfaces/User';
import UserService from './User.service';
import UserMongoRepository from '../repository/UserMongo.repository';
import UserRepository from '../interfaces/UserRepository';
import ZodPayloadValidator, { userRegisterSchema } from '../zod/ZodPayloadValidator';

class RegisterService extends UserService {
	constructor(userRepository: UserRepository, payloadValidator: PayloadValidator, customError: CustomError) {
		super(userRepository, payloadValidator, customError);
	}

	public registerNewUser(userData: User) {
		try {
			this.payloadValidator.validatePayload(userData);
			console.log(userData);
		} catch(err: unknown) {
			this.payloadValidator.handleValidateError(err, this.customError);
			this.userRepository.handleRepositoryError(err, this.customError);
		}
	}
}

export default new RegisterService(
	UserMongoRepository,
	new ZodPayloadValidator(userRegisterSchema),
	new CustomErrorImp()
);
