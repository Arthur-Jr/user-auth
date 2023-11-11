import EditUserPayload from './EditUserPayload';

interface UserManagerService {
  editUser(userPayload: EditUserPayload): Promise<void>,
  addEmailToTestUser(userPayload: EditUserPayload): Promise<{ token: string }> | never,
  getUserByUsername(username: string): Promise<{ username: string, email: string | undefined, status: number }> | never,
  deleteUser(userPayload: EditUserPayload): Promise<void>,
  forgetPassword(email: string): Promise<void>,
}

export default UserManagerService;
