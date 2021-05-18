import { Router, Request, Response } from "express";
import * as express from "express";
import { REQUEST_URL_HEAD } from "../server-constants";

export const AuthRouter: Router = express.Router();

// AuthRouter.post(REQUEST_URL_HEAD + '/*', async (req: Request, res: Response) => {
//     const trussId = req.params.id;
//     const response = await .getHistoryByTrussId(trussId);
//     res.json(response);
// });