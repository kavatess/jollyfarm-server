import * as express from "express";
import * as jwt from 'jsonwebtoken';
import { Router, Request, Response } from "express";
import { API_ROUTE_BEGIN, AUTH_TOKEN_SECRET, AUTH_ROUTE_BEGIN } from "../server-constants";
import { findUser } from "./services/find-user.service";
import { registerUser } from "./services/register.service";
import { updateUserInfo } from "./services/update-user-info.service";
import { updateLoginPassword } from "./services/update-login-password.service";
import { RegisterInfo } from "./models/register-info.model";
import { UpdateUserBody } from "./models/update-user-body.model";
import { handleInvalidRequestError, handleUnauthorizedRequestError } from "../shared/services/error-handler.service";
import { checkTypeOfString } from "../shared/validators/type-check.validator";

export const AuthRouter: Router = express.Router();

AuthRouter.post(API_ROUTE_BEGIN + '/*', async (req: Request, res: Response, next) => {
    try {
        const authToken = req.headers['authorization']?.split(' ')[1];
        if (!authToken) throw new Error("Token does not exist!");
        jwt.verify(authToken, AUTH_TOKEN_SECRET);
        next();
    } catch (err) {
        return handleUnauthorizedRequestError(err, res);
    }
});

AuthRouter.post(AUTH_ROUTE_BEGIN + '/login', async (req: Request, res: Response) => {
    try {
        const { phoneNumber, password } = req.body;
        const userInfo = await findUser(phoneNumber, password);
        const authToken = jwt.sign(userInfo, AUTH_TOKEN_SECRET);
        res.json({ token: authToken, user: userInfo });
    } catch (err) {
        return handleUnauthorizedRequestError(err, res);
    }
});

AuthRouter.post(AUTH_ROUTE_BEGIN + '/register', async (req: Request, res: Response) => {
    try {
        const response = await registerUser(req.body as RegisterInfo);
        res.json(response);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

AuthRouter.post(AUTH_ROUTE_BEGIN + '/user/update', async (req: Request, res: Response) => {
    try {
        const response = await updateUserInfo(req.body as UpdateUserBody);
        res.json(response);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

AuthRouter.post(AUTH_ROUTE_BEGIN + '/password/update', async (req: Request, res: Response) => {
    try {
        const { phoneNumber, oldPassword, newPassword } = req.body;
        if (!checkTypeOfString(phoneNumber) || !checkTypeOfString(oldPassword) || !checkTypeOfString(newPassword)) {
            throw new Error('Invalid request.');
        }
        const response = await updateLoginPassword(phoneNumber, oldPassword, newPassword);
        res.json(response);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});