import TrussService from "./truss.services";
import { Router, Request, Response } from "express";
import * as express from "express";
import { createTrussRequest, newStatusRequest, revertTrussRequest, simpleRequest, updateMaxHoleRequest } from "./truss.request.model";
import { TRUSS_REQUEST } from "../../server-constants";

export const TrussRouter: Router = express.Router();

TrussRouter.post(TRUSS_REQUEST.getTrussData, async (req: Request, res: Response) => {
    const block = req.params.block;
    const trussArr = await TrussService.getTrussArrByBlock(block);
    res.send(trussArr);
});

TrussRouter.post(TRUSS_REQUEST.getStatistics, async (_req: Request, res: Response) => {
    const trussArr = await TrussService.getStatistics();
    res.send(trussArr);
});

TrussRouter.post(TRUSS_REQUEST.updateStatus, async (req: Request, res: Response) => {
    const newStatusTruss: newStatusRequest = req.body;
    const response = await TrussService.updateTrussStatus(newStatusTruss);
    res.send(response);
});

TrussRouter.post(TRUSS_REQUEST.createTruss, async (req: Request, res: Response) => {
    const newTruss: createTrussRequest = req.body;
    const response = await TrussService.createNewTruss(newTruss);
    res.send(response);
});

TrussRouter.put(TRUSS_REQUEST.clearTruss, async (req: Request, res: Response) => {
    const trussId: simpleRequest = req.body;
    const response = await TrussService.clearTruss(trussId._id);
    res.send(response);
});

TrussRouter.post(TRUSS_REQUEST.updateMaxHole, async (req: Request, res: Response) => {
    const newMaxHole: updateMaxHoleRequest = req.body;
    const response = await TrussService.updateTrussMaxHole(newMaxHole);
    res.send(response);
});

TrussRouter.post(TRUSS_REQUEST.revertStatus, async (req: Request, res: Response) => {
    const revertStatus: revertTrussRequest = req.body;
    const response = await TrussService.revertTrussStatus(revertStatus);
    res.send(response);
});

TrussRouter.post(TRUSS_REQUEST.getTimelineById, async (req: Request, res: Response) => {
    const trussId = req.params.id;
    const response = await TrussService.getTimeLineData(trussId);
    res.send(response);
});