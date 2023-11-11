interface Auth {
  getToken(userData: { username: string, status: number }, tokenPeriod?: string): string,
  decodeToken(token: string): unknown,
}

export default Auth;
