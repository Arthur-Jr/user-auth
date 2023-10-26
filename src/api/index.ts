import MongoConnection from '../model/MongoConnection';
import App from './server';

new App(MongoConnection).getApp();
