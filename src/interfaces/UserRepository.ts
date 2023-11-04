import CustomError from './CustomError';
import User from './User';

interface UserRepository {
  registerUser(userData: User): Promise<User>,
  findUserByUsername(username: string): Promise<User | null>,
  findUserByEmail(email: string): Promise<User | null>,
  handleRepositoryError(err: unknown, customError: CustomError): void,
}

export default UserRepository;
