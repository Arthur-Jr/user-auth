const constants = {
	cookieTokenKeyName: 'userToken',
	cookieDefaultSettings: { httpOnly: true, sameSite: 'Lax', secure: true, maxAge: (7 * 24 * 60 * 60 * 1000), path: '/' },
};

export default constants;
