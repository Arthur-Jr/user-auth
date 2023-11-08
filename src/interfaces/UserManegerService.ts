import EditUserPayload from './EditUserPayload';

interface UserManagerService {
  editUser(userPayload: EditUserPayload): Promise<void>,
}

export default UserManagerService;
