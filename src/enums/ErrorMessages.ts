enum ErrorMessages {
  SHORT_USERNAME = 'Username must have 3 or more character!',
  SHORT_PASSWORD = 'Password must have 6 or more character!',
  DUPLICATED_FIELD = 'already in use!',
  INTERNAL_SERVER_ERROR = 'Internal Server Error!',
  INVALID_DATA_LOGIN = 'Incorrect username/email or password!',
  USER_NOT_FOUND = 'User not Found!', 
  INVALID_USERNAME = 'Invalid username!',
  INVALID_PASSWORD = 'Invalid Password!',
  INVALID_AUTH = 'Invalid token!',
  INVALID_ACC_TYPE = 'Invalid account type!',
  INVALID_EMAIL = 'Invalid email',
  TEST_ACC_DELETED = 'Test account already deleted!',
  SOMETHING_WENT_WRONG = 'Something went wrong!',
  UNDELIVERABLE_EMAIL = 'Undeliverable email!',
}

export default ErrorMessages;
