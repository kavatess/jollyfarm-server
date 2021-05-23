import { Router, Request, Response } from "express";
import * as express from "express";
import { CreateTrussRequest, NewStatusRequest, RevertTrussRequest, UpdateMaxHoleRequest } from "./truss.request.model";
import { REQUEST_URL_HEAD } from "../../server-constants";
import { TrussService } from "./truss.service";

export const TrussRouter: Router = express.Router();

TrussRouter.post(REQUEST_URL_HEAD + '/truss/block/:block', async (req: Request, res: Response) => {
    const block = req.params.block;
    const trussArr = await TrussService.getTrussDataByBlock(block);
    res.json(trussArr);
});

TrussRouter.post(REQUEST_URL_HEAD + '/truss/raw/:block', async (req: Request, res: Response) => {
    const block = req.params.block;
    const trussArr = await TrussService.getRawTrussDataByBlock(block);
    res.json(trussArr);
});

TrussRouter.post(REQUEST_URL_HEAD + '/truss/statistics', async (req: Request, res: Response) => {
    const reqQuery = req.query;
    const trussArr = await TrussService.getStatistics(reqQuery);
    res.json(trussArr);
});

TrussRouter.post(REQUEST_URL_HEAD + '/truss/update/status', async (req: Request, res: Response) => {
    const newStatusTruss: NewStatusRequest = req.body;
    if (new Date(newStatusTruss.date).toString() != "Invalid Date") {
        const response = await TrussService.updateTrussStatus(newStatusTruss);
        res.json(response);
    } else {
        res.sendStatus(405);
    }
});

TrussRouter.post(REQUEST_URL_HEAD + '/truss/create', async (req: Request, res: Response) => {
    const newTruss: CreateTrussRequest = req.body;
    const response = await TrussService.createNewTruss(newTruss);
    res.json(response);
});

TrussRouter.post(REQUEST_URL_HEAD + '/truss/clear/:id', async (req: Request, res: Response) => {
    const trussId = req.params.id;
    const response = await TrussService.clearTruss(trussId);
    res.json(response);
});

TrussRouter.post(REQUEST_URL_HEAD + '/truss/update/maxhole', async (req: Request, res: Response) => {
    const newMaxHole: UpdateMaxHoleRequest = req.body;
    const response = await TrussService.updateTrussMaxHole(newMaxHole);
    res.json(response);
});

TrussRouter.post(REQUEST_URL_HEAD + '/truss/revert/status', async (req: Request, res: Response) => {
    const revertStatus: RevertTrussRequest = req.body;
    const response = await TrussService.revertTrussStatus(revertStatus);
    res.json(response);
});