import jwt from 'jsonwebtoken';

import Auth from '../interfaces/Auth';

class JwtAuth implements Auth {
	private readonly secret: string = process.env.JWT_SECRET_KEY || 'testKey';

	getToken(userData: { username: string; status: number; }): string {
		return jwt.sign({ data: userData }, this.secret, { algorithm: 'HS256', expiresIn: '24h' });
	}

	decodeToken(token: string): void {
		jwt.verify(token, this.secret);
	}  
}

export default JwtAuth;
