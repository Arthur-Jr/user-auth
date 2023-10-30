import express from 'express';
import RegisterController from '../controller/Register.controller';

const userRouter = express.Router();

userRouter.post('/register', (req, res, next) => RegisterController.registerNewUser(req, res, next));

export default userRouter;
