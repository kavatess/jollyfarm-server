import TrussService from "./truss.services";
import { Router, Request, Response } from "express";
import * as express from "express";
import { createTrussRequest, newStatusRequest, revertTrussRequest, simpleRequest, updateMaxHoleRequest } from "./truss.request.model";
import { REQUEST_URL_HEAD } from "../../server-constants";

export const TrussRouter: Router = express.Router();

TrussRouter.post(REQUEST_URL_HEAD + '/truss/block/:block', async (req: Request, res: Response) => {
    const block = req.params.block;
    const trussArr = await TrussService.getTrussArrByBlock(block);
    res.send(trussArr);
});

TrussRouter.post(REQUEST_URL_HEAD + '/truss/statistics', async (_req: Request, res: Response) => {
    const trussArr = await TrussService.getStatistics();
    res.send(trussArr);
});

TrussRouter.post(REQUEST_URL_HEAD + '/truss/update/status', async (req: Request, res: Response) => {
    const newStatusTruss: newStatusRequest = req.body;
    const response = await TrussService.updateTrussStatus(newStatusTruss);
    res.send(response);
});

TrussRouter.post(REQUEST_URL_HEAD + '/truss/create', async (req: Request, res: Response) => {
    const newTruss: createTrussRequest = req.body;
    const response = await TrussService.createNewTruss(newTruss);
    res.send(response);
});

TrussRouter.post(REQUEST_URL_HEAD + '/truss/clear/:id', async (req: Request, res: Response) => {
    const trussId = req.params.id;
    const response = await TrussService.clearTruss(trussId);
    res.send(response);
});

TrussRouter.post(REQUEST_URL_HEAD + '/truss/update/maxhole', async (req: Request, res: Response) => {
    const newMaxHole: updateMaxHoleRequest = req.body;
    const response = await TrussService.updateTrussMaxHole(newMaxHole);
    res.send(response);
});

TrussRouter.post(REQUEST_URL_HEAD + '/truss/revert/status', async (req: Request, res: Response) => {
    const revertStatus: revertTrussRequest = req.body;
    const response = await TrussService.revertTrussStatus(revertStatus);
    res.send(response);
});

TrussRouter.post(REQUEST_URL_HEAD + '/truss/timeline/:id', async (req: Request, res: Response) => {
    const trussId = req.params.id;
    const response = await TrussService.getTimeLineData(trussId);
    res.send(response);
});