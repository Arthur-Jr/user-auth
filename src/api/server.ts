import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import DbConnection from '../interfaces/DbConnection';
import ErrorMiddleware from '../middlewares/ErrorMiddleware';
import userRouter from '../router/user.router';

export default class App {
	private readonly express: express.Application;
	private readonly port = 8080;
	private readonly db: DbConnection;

	constructor(db: DbConnection) {
		this.db = db;
		this.express = express();
		this.connectDb();
		this.middlewares();
		this.setRouter();
		this.errorMiddleware();
		this.listen();
	}

	public getApp(): express.Application {
		return this.express;
	}

	private connectDb(): void {
		this.db.connectDb();
	}

	public middlewares(): void {
		// const origin = process.env.FRONT_URL;
		this.express.use(bodyParser.json());
		this.express.use(cors());
	}

	public errorMiddleware(): void {
		this.express.use(ErrorMiddleware.handleCustomError);
	}

	public setRouter() {
		this.express.use('/user', userRouter);
	}

	private listen(): void {
		this.express.listen(this.port, () => console.log(`Server running on port ${this.port}!`));
	}
}
