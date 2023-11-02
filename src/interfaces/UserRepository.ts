import CustomError from './CustomError';
import User from './User';

interface UserRepository {
  registerUser(userData: User): Promise<User>,
  registerTestUser(userData: User): Promise<User>,
  handleRepositoryError(err: unknown, customError: CustomError): void,
}

export default UserRepository;
