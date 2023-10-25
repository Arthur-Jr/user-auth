import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

export default class App {
	private readonly express: express.Application;
	private readonly port = 8080;

	constructor() {
		this.express = express();
		this.middlewares();
		this.listen();
	}

	public getApp(): express.Application {
		return this.express;
	}

	public middlewares(): void {
		this.express.use(bodyParser.json());
		this.express.use(cors());
	}

	private listen(): void {
		this.express.listen(this.port, () => console.log(`Server running on port ${this.port}!`));
	}
}
