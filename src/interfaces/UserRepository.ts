import User from './User';

interface UserRepository {
  registerUser(userData: User): Promise<User>,
}

export default UserRepository;
