import { Router, Request, Response } from "express";
import * as express from "express";
import { REQUEST_URL_HEAD } from "../../server-constants";
import HistoryService from "./history.service";

export const HistoryRouter: Router = express.Router();

HistoryRouter.post(REQUEST_URL_HEAD + '/truss/history/:id', async (req: Request, res: Response) => {
    const trussId = req.params.id;
    const response = await HistoryService.getHistoryByTrussId(trussId);
    res.json(response);
});