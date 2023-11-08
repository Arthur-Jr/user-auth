import CustomError from './CustomError';
import User from './User';
import UserPayload from './UserPayload';

interface UserRepository {
  registerUser(userData: UserPayload): Promise<User>,
  findUserByUsername(username: string): Promise<User | null>,
  findUserByEmail(email: string): Promise<User | null>,
  handleRepositoryError(err: unknown, customError: CustomError): void,
  editEmail(username: string, email: string): Promise<void>,
  editPassword(username: string, password: string): Promise<void>,
  addEmailToTestUser(username: string, email: string, status: number): Promise<void>,
}

export default UserRepository;
