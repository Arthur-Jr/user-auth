import UserPayload from './UserPayload';

interface LoginService {
  login(userData: UserPayload): Promise<{ token: string }>
}

export default LoginService;
