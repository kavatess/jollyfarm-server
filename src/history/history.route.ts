import { Router, Request, Response } from "express";
import * as express from "express";
import { API_ROUTE_BEGIN } from "../server-constants";
import { HistoryService } from "./history.service";

export const HistoryRouter: Router = express.Router();

HistoryRouter.post(API_ROUTE_BEGIN + '/truss/history/:id', async (req: Request, res: Response) => {
    const trussId = req.params.id;
    const response = await HistoryService.getHistoryByTrussId(trussId);
    res.json(response);
});