import EditUserPayload from './EditUserPayload';

interface UserManagerService {
  editUser(userPayload: EditUserPayload): Promise<void>,
  addEmailToTestUser(userPayload: EditUserPayload): Promise<{ token: string }> | never,
}

export default UserManagerService;
