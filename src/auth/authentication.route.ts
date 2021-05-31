import * as express from "express";
import * as jwt from 'jsonwebtoken';
import { AuthService } from "./authentication.service";
import { Router, Request, Response } from "express";
import { API_ROUTE_BEGIN, AUTH_TOKEN_SECRET, AUTH_ROUTE_BEGIN } from "../server-constants";
import { RegisterInfo, UpdateUserRequest } from "./user.model";

export const AuthRouter: Router = express.Router();

AuthRouter.post(API_ROUTE_BEGIN + '/*', async (req: Request, res: Response, next) => {
    try {
        const authToken = req.headers['authorization']?.split(' ')[1];
        if (!authToken) throw new Error("Token does not exist!");
        jwt.verify(authToken, AUTH_TOKEN_SECRET);
        next();
    } catch (err) {
        console.log(err);
        res.sendStatus(401);
    }
});

AuthRouter.post(AUTH_ROUTE_BEGIN + '/login', async (req: Request, res: Response) => {
    try {
        const { phoneNumber, password } = req.body;
        const userInfo = await AuthService.findUser(phoneNumber, password);
        const authToken = jwt.sign(userInfo, AUTH_TOKEN_SECRET);
        res.json({ token: authToken, user: userInfo });
    } catch (err) {
        console.log(err);
        res.sendStatus(401);
    }
});

AuthRouter.post(AUTH_ROUTE_BEGIN + '/register', async (req: Request, res: Response) => {
    try {
        const response = await AuthService.registerUser(req.body as RegisterInfo);
        res.send(response);
    } catch (err) {
        console.log(err);
        res.sendStatus(405);
    }
});

AuthRouter.post(AUTH_ROUTE_BEGIN + '/user/update', async (req: Request, res: Response) => {
    try {
        const response = await AuthService.changeUserInfo(req.body as UpdateUserRequest);
        res.send(response);
    } catch (err) {
        console.log(err);
        res.sendStatus(405);
    }
});

AuthRouter.post(AUTH_ROUTE_BEGIN + '/password/update', async (req: Request, res: Response) => {
    try {
        const { phoneNumber, oldPassword, newPassword } = req.body;
        const response = await AuthService.changeLoginPassword(phoneNumber, oldPassword, newPassword);
        res.send(response);
    } catch (err) {
        console.log(err);
        res.sendStatus(405);
    }
});