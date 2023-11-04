import express from 'express';

import RegisterController from '../controller/Register.controller';
import LoginController from '../controller/Login.controller';

const userRouter = express.Router();

userRouter.post('/register', (req, res, next) => RegisterController.registerNewUser(req, res, next));
userRouter.post('/login', (req, res, next) => LoginController.login(req, res, next));

export default userRouter;
