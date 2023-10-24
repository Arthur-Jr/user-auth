import { ObjectId } from 'mongoose';
import Status from '../enums/Status';

interface UserInterface {
  _id?: ObjectId,
  username: string,
  email?: string,
  password: string,
  status?: Status,
  createdAt?: Date,
}

export default UserInterface;
