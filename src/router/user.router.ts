import express from 'express';

import LoginController from '../controller/Login.controller';
import RegisterController from '../controller/Register.controller';
import UserManagerController from '../controller/UserManager.controller';
import AuthMiddeware from '../middlewares/AuthMiddeware';

const userRouter = express.Router();

userRouter.get('/start', (_req, res) => res.status(204).json());
userRouter.post('/register', (req, res, next) => RegisterController.registerNewUser(req, res, next));
userRouter.post('/login', (req, res, next) => LoginController.login(req, res, next));
userRouter.post('/login-token', (req, res, next) => LoginController.loginToken(req, res, next));
userRouter.post('/forgot-password', (req, res, next) => UserManagerController.forgetPassword(req, res, next));

userRouter.put('/reset',
	(req, res, next) => AuthMiddeware.handleResetAuthMiddleware(req, res, next),
	(req, res, next) => UserManagerController.resetPassword(req, res, next)
);

userRouter.use((req, res, next) => AuthMiddeware.handleAuthMiddleware(req, res, next));
userRouter.put('/', (req, res, next) => UserManagerController.editUser(req, res, next));
userRouter.put('/test-email', (req, res, next) => UserManagerController.addEmailToTestUser(req, res, next));
userRouter.get('/', (req, res, next) => UserManagerController.getUserByUsername(req, res, next));
userRouter.delete('/',(req, res, next) => UserManagerController.deleteUser(req, res, next));
userRouter.post('/logout', (req, res, next) => LoginController.logout(req, res, next));

export default userRouter;
