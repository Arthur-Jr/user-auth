import express from 'express';

export default class App {
	private readonly express: express.Application;
	private readonly port = 8080;

	constructor() {
		this.express = express();
		this.listen();
	}

	public getApp(): express.Application {
		return this.express;
	}

	private listen(): void {
		this.express.listen(this.port, () => console.log(`Server running on port ${this.port}!`));
	}
}
