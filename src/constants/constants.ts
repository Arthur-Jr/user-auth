const constants = {
	cookieTokenKeyName: 'userToken',
	cookieDefaultSettings: { httpOnly: true, secure: false, maxAge: (7 * 24 * 60 * 60 * 1000), path: '/' },
};

export default constants;
