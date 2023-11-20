interface Auth {
  getToken(userData: { username: string, status: number, reset?: boolean }, tokenPeriod?: string): string,
  decodeToken(token: string): unknown,
}

export default Auth;
