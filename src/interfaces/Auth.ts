interface Auth {
  getToken(userData: { username: string, status: number }): string,
  decodeToken(token: string): unknown,
}

export default Auth;
