import { trussService } from "./truss.service";
import { Router, Request, Response } from "express";
import * as express from "express";
import { createTrussRequest, newStatusRequest, revertTrussRequest, TrussModel, updateMaxHoleRequest } from "./truss.model";
import { TRUSS_REQUEST } from "../../server-constants";

class TrussController extends trussService {
    router: Router = express.Router();

    constructor() {
        super();
        this.router.post(TRUSS_REQUEST, this.getTrussController());
        this.router.post(TRUSS_REQUEST + '/update/status', this.updateTrussStatusController());
        this.router.post(TRUSS_REQUEST + '/create', this.createNewTrussController());
        this.router.post(TRUSS_REQUEST + '/clear', this.clearTrussController());
        this.router.post(TRUSS_REQUEST + '/update/maxhole', this.updateTrussMaxHoleController());
        this.router.post(TRUSS_REQUEST + '/revert/history', this.revertTrussStatusController());
        this.router.post(TRUSS_REQUEST + '/history', this.getHistory());
        this.router.post(TRUSS_REQUEST + '/recent/history', this.getRecentHistory());
    }

    private getTrussController() {
        return async (_req: Request, res: Response) => {
            const trussArr = await this.getTrussDataForClient();
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
            const trussId: string = req.body;
            const response = await this.clearTruss(trussId);
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

    private getHistory() {
        return async (req: Request, res: Response) => {
            const trussId = req.body;
            const response = await this.getOldHistoryData(trussId._id);
            res.send(response);
        }
    }

    private getRecentHistory() {
        return async (req: Request, res: Response) => {
            const trussId = req.body;
            const response = await this.getRecentHistoryData(trussId._id);
            res.send(response);
        }
    }
}

export default new TrussController();