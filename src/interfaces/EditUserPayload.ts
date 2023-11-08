interface EditUserPayload {
  username: string,
  password: string,
  email?: string,
  newPassword?: string,
}

export default EditUserPayload;
