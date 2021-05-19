import { Router, Request, Response } from "express";
import * as express from "express";
import { AUTH_REQUEST_URL_BEGIN, AUTH_TOKEN_SECRET, REQUEST_URL_HEAD } from "../server-constants";
import * as jwt from 'jsonwebtoken';
import { AuthService } from "./authentication.service";

export const AuthRouter: Router = express.Router();

AuthRouter.post(AUTH_REQUEST_URL_BEGIN + '/login', async (req: Request, res: Response, next) => {
    try {
        const loginInfo = req.body;
        const userInfo = await AuthService.verifyUser(loginInfo);
        const authToken = jwt.sign(userInfo, AUTH_TOKEN_SECRET);
        res.json({ token: authToken });
    } catch (err) {
        console.log(err);
        res.sendStatus(403);
    }
});

AuthRouter.post(REQUEST_URL_HEAD + '/*', async (req: Request, res: Response, next) => {
    try {
        const authToken = req.headers['authorization']?.split(' ')[1];
        if (!authToken) throw new Error("Token does not exist!");
        jwt.verify(authToken, AUTH_TOKEN_SECRET);
        next();
    } catch (err) {
        res.sendStatus(403);
    }
});