import ErrorMessages from '../enums/ErrorMessages';
import HttpStatusCode from '../enums/HttpStatusCode';
import CustomError from '../interfaces/CustomError';

class CustomErrorImp extends Error implements CustomError {
	private status: number;

	constructor(msg?: string, status?: number) {
		super(msg || ErrorMessages.INTERNAL_SERVER_ERROR);
		this.status = status || HttpStatusCode.INTERNAL;
	}

	getMessage(): string {
		return this.message;
	}

	getStatus(): number {
		return this.status;
	}

	setMessage(msg: string): void {
		this.message = msg;
	}

	setStatus(status: number): void {
		this.status = status;
	}
}

export default CustomErrorImp;
