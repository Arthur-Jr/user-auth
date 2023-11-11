import express from 'express';

import RegisterController from '../controller/Register.controller';
import LoginController from '../controller/Login.controller';
import UserManagerController from '../controller/UserManager.controller';
import AuthMiddeware from '../middlewares/AuthMiddeware';

const userRouter = express.Router();

userRouter.post('/register', (req, res, next) => RegisterController.registerNewUser(req, res, next));
userRouter.post('/login', (req, res, next) => LoginController.login(req, res, next));
userRouter.post('/forget', (req, res, next) => UserManagerController.forgetPassword(req, res, next));

userRouter.use((req, res, next) => AuthMiddeware.handleAuthMiddleware(req, res, next));
userRouter.put('/', (req, res, next) => UserManagerController.editUser(req, res, next));
userRouter.put('/test-email', (req, res, next) => UserManagerController.addEmailToTestUser(req, res, next));
userRouter.get('/', (req, res, next) => UserManagerController.getUserByUsername(req, res, next));
userRouter.delete('/',(req, res, next) => UserManagerController.deleteUser(req, res, next));

export default userRouter;
