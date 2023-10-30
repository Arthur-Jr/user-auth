import DbConnection from '../interfaces/DbConnection';
import mongoose from 'mongoose';
import 'dotenv/config';

class MongoConnection implements DbConnection {
	private readonly uri: string;
  
	constructor(uri: string) {
		this.uri = uri;
	}

	public connectDb(): void {
		mongoose.connect(this.uri);
	}
}

export default new MongoConnection(process.env.DB_URI || '');
