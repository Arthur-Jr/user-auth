interface Auth {
  getToken(userData: { username: string, status: number }): string,
  decodeToken(token: string): void,
}

export default Auth;
