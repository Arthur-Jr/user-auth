import { Request } from 'express';

interface ExtendedRequest extends Request {
  body: { username?: string, password?: string, email?: string },
  cookies: { userToken?: string },
}

export default ExtendedRequest;
