import jwt, { JwtPayload } from 'jsonwebtoken';

import Auth from '../interfaces/Auth';

class JwtAuth implements Auth {
	private readonly secret: string = process.env.JWT_SECRET_KEY || 'testKey';

	public getToken(userData: { username: string; status: number; }, tokenPeriod?: string): string {
		return jwt.sign({ data: userData }, this.secret, { algorithm: 'HS256', expiresIn: tokenPeriod || '7d' });
	}

	public decodeToken(token: string): JwtPayload | string {
		return jwt.verify(token, this.secret);
	}  
}

export default JwtAuth;
