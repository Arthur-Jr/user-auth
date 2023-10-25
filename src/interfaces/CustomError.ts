interface CustomError {
  getMessage(): string,
  getStatus(): number,
  setMessage(msg: string): void,
  setStatus(status: number): void,
}

export default CustomError;
