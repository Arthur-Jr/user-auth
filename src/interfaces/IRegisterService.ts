import UserPayload from './UserPayload';

interface IRegisterService {
  registerNewUser(userData: UserPayload): Promise<{ token: string }>,
}

export default IRegisterService;
