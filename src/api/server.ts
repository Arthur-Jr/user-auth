import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import ErrorMiddleware from '../middlewares/ErrorMiddleware';

export default class App {
	private readonly express: express.Application;
	private readonly port = 8080;

	constructor() {
		this.express = express();
		this.middlewares();
		this.errorMiddleware();
		this.listen();
	}

	public getApp(): express.Application {
		return this.express;
	}

	public middlewares(): void {
		this.express.use(bodyParser.json());
		this.express.use(cors());
	}

	public errorMiddleware(): void {
		this.express.use(ErrorMiddleware.handleCustomError);
	}

	private listen(): void {
		this.express.listen(this.port, () => console.log(`Server running on port ${this.port}!`));
	}
}
