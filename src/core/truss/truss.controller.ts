import { TrussService } from "./truss.service";
import { Router, Request, Response } from "express";
import * as express from "express";
import { createTrussRequest, newStatusRequest, revertTrussRequest, simpleRequest, updateMaxHoleRequest } from "./truss.request.model";
import { TRUSS_REQUEST } from "../../server-constants";

class TrussController extends TrussService {
    router: Router = express.Router();

    constructor() {
        super();
        this.router.post(TRUSS_REQUEST.getTrussData, this.getTrussDataController());
        this.router.post(TRUSS_REQUEST.getStatistics, this.getStatisticsController());
        this.router.post(TRUSS_REQUEST.updateStatus, this.updateTrussStatusController());
        this.router.post(TRUSS_REQUEST.createTruss, this.createNewTrussController());
        this.router.put(TRUSS_REQUEST.clearTruss, this.clearTrussController());
        this.router.post(TRUSS_REQUEST.updateMaxHole, this.updateTrussMaxHoleController());
        this.router.post(TRUSS_REQUEST.revertStatus, this.revertTrussStatusController());
        this.router.post(TRUSS_REQUEST.getTimelineById, this.getTimeLineDataController());
    }

    private getTrussDataController() {
        return async (req: Request, res: Response) => {
            const block = req.params.block;
            const trussArr = await this.getTrussArrByBlock(block);
            res.send(trussArr);
        }
    }

    private getStatisticsController() {
        return async (_req: Request, res: Response) => {
            const trussArr = await this.getStatistics();
            res.send(trussArr);
        }
    }

    private updateTrussStatusController() {
        return async (req: Request, res: Response) => {
            const newStatusTruss: newStatusRequest = req.body;
            const response = await this.updateTrussStatus(newStatusTruss);
            res.send(response);
        }
    }

    private createNewTrussController() {
        return async (req: Request, res: Response) => {
            const newTruss: createTrussRequest = req.body;
            const response = await this.createNewTruss(newTruss);
            res.send(response);
        }
    }

    private clearTrussController() {
        return async (req: Request, res: Response) => {
            const trussId: simpleRequest = req.body;
            const response = await this.clearTruss(trussId._id);
            res.send(response);
        }
    }

    private updateTrussMaxHoleController() {
        return async (req: Request, res: Response) => {
            const newMaxHole: updateMaxHoleRequest = req.body;
            const response = await this.updateTrussMaxHole(newMaxHole);
            res.send(response);
        }
    }

    private revertTrussStatusController() {
        return async (req: Request, res: Response) => {
            const revertStatus: revertTrussRequest = req.body;
            const response = await this.revertTrussStatus(revertStatus);
            res.send(response);
        }
    }

    private getTimeLineDataController() {
        return async (req: Request, res: Response) => {
            const trussId = req.params.id;
            const response = await this.getTimeLineData(trussId);
            res.send(response);
        }
    }
}

export default new TrussController();