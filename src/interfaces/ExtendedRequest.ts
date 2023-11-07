import { Request } from 'express';

interface ExtendedRequest extends Request {
  body: { username?: string, password?: string, email?: string },
}

export default ExtendedRequest;
