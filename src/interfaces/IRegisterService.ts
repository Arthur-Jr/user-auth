import User from './User';

interface IRegisterService {
  registerNewUser(userData: User): Promise<{ token: string }>,
}

export default IRegisterService;
