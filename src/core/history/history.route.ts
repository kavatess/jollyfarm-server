import { Router, Request, Response } from "express";
import * as express from "express";
import { API_ROUTE_BEGIN } from "../../server-constants";
import { getHistoryArrByTrussId } from "./services/get-history-arr.service";
import { handleInvalidRequestError } from "../../shared/error-handler.service";

export const HistoryRouter: Router = express.Router();

HistoryRouter.post(API_ROUTE_BEGIN + '/truss/history/:id', async (req: Request, res: Response) => {
    try {
        const trussId = req.params.id;
        const response = await getHistoryArrByTrussId(trussId);
        res.json(response);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});