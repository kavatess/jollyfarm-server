import { trussService } from "./truss.service";
import { Router, Request, Response } from "express";
import * as express from "express";
import { createTrussRequest, newStatusRequest, TrussModel } from "./truss.model";

class TrussController extends trussService {
    router: Router = express.Router();

    constructor() {
        super();
        this.router.post('/truss', this.getTrussController());
        this.router.post('/truss/update/status', this.updateTrussStatusController());
        this.router.post('/truss/create', this.createNewTrussController());
        this.router.post('/truss/clear', this.clearTrussController());
        this.router.post('/truss/update/maxhole', this.updateTrussMaxHoleController());
        this.router.post('/truss/revert/history', this.revertTrussStatusController());
        this.router.post('/truss/history', this.getHistory());
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
            const truss = req.body;
            const response = await this.clearTruss(truss);
            res.send(response);
        }
    }

    private updateTrussMaxHoleController() {
        return async (req: Request, res: Response) => {
            const newMaxHole = req.body;
            const response = await this.updateTrussMaxHole(newMaxHole);
            res.send(response);
        }
    }

    private revertTrussStatusController() {
        return async (req: Request, res: Response) => {
            const revertStatus = req.body;
            const response = await this.updateTrussStatus(revertStatus);
            res.send(response);
        }
    }

    private getHistory() {
        return async (_req: Request, res: Response) => {
            const response = await this.getTrussData();
            res.send(response);
        }
    }
}

export default new TrussController();