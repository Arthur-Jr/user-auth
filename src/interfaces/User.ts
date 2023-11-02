import { ObjectId } from 'mongoose';
interface User {
  _id?: ObjectId,
  username: string,
  email?: string,
  password: string,
  status?: number,
  createdAt?: Date,
}

export default User;
