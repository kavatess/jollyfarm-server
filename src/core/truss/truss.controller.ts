import { trussService } from "./truss.service";
import { Router, Request, Response } from "express";
import * as express from "express";
import { createTrussRequest, newStatusRequest, revertTrussRequest, simpleRequest, updateMaxHoleRequest } from "./truss.request.model";
import { TRUSS_REQUEST_HEAD, TRUSS_REQUEST_TAIL } from "../../server-constants";

class TrussController extends trussService {
    router: Router = express.Router();

    constructor() {
        super();
        this.router.post(TRUSS_REQUEST_HEAD + TRUSS_REQUEST_TAIL.getTruss, this.getTrussController());
        this.router.post(TRUSS_REQUEST_HEAD + TRUSS_REQUEST_TAIL.updateStatus, this.updateTrussStatusController());
        this.router.post(TRUSS_REQUEST_HEAD + TRUSS_REQUEST_TAIL.createTruss, this.createNewTrussController());
        this.router.post(TRUSS_REQUEST_HEAD + TRUSS_REQUEST_TAIL.clearTruss, this.clearTrussController());
        this.router.post(TRUSS_REQUEST_HEAD + TRUSS_REQUEST_TAIL.updateMaxHole, this.updateTrussMaxHoleController());
        this.router.post(TRUSS_REQUEST_HEAD + TRUSS_REQUEST_TAIL.revertHistory, this.revertTrussStatusController());
        this.router.post(TRUSS_REQUEST_HEAD + TRUSS_REQUEST_TAIL.getHistoryById, this.getHistoryController());
        this.router.post(TRUSS_REQUEST_HEAD + TRUSS_REQUEST_TAIL.getRecentHistoryById, this.getRecentHistoryController());
    }

    private getTrussController() {
        return async (req: Request, res: Response) => {
            const block: string = req.params.block;
            const trussArr = await this.getTrussDataForClient(block);
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

    private getHistoryController() {
        return async (req: Request, res: Response) => {
            const trussId: simpleRequest = req.body;
            const response = await this.getOldHistoryData(trussId._id);
            res.send(response);
        }
    }

    private getRecentHistoryController() {
        return async (req: Request, res: Response) => {
            const trussId: simpleRequest = req.body;
            const response = await this.getRecentHistoryData(trussId._id);
            res.send(response);
        }
    }
}

export default new TrussController();