import { trussService } from "./truss.service";
import { Router, Request, Response } from "express";
import * as express from "express";
import { newMaxHoleRequestModel, newStatusRequestModel, trussModel } from "./truss.model";

export class trussController extends trussService {
    router: Router = express.Router();
    constructor() {
        super();
        this.router.post('/truss', this.getTrussController());
        this.router.post('/truss/update/status', this.updateTrussStatusController());
        this.router.post('/truss/create', this.createNewTrussController());
        this.router.post('/truss/clear', this.clearTrussController());
        this.router.post('/truss/update/maxhole', this.updateTrussMaxHoleController());
        this.router.post('/truss/revert/history', this.revertTrussStatusController());
    }
    private getTrussController() {
        return async (_req: Request, res: Response) => {
            const trussArr = await this.getDataFromCollection();
            res.send(trussArr);
        }
    }
    private updateTrussStatusController() {
        return async (req: Request, res: Response) => {
            const newStatusTruss: newStatusRequestModel = req.body;
            const response = await this.updateTrussStatus(newStatusTruss);
            res.send(response);
        }
    }
    private createNewTrussController() {
        return async (req: Request, res: Response) => {
            const newTruss: trussModel = req.body;
            const response = await this.createNewTruss(newTruss);
            res.send(response);
        }
    }
    private clearTrussController() {
        return async (req: Request, res: Response) => {
            const truss: trussModel = req.body;
            const response = await this.clearTruss(truss);
            res.send(response);
        }
    }
    private updateTrussMaxHoleController() {
        return async (req: Request, res: Response) => {
            const newMaxHole: newMaxHoleRequestModel = req.body;
            const response = await this.updateTrussMaxHole(newMaxHole);
            res.send(response);
        }
    }
    private revertTrussStatusController() {
        return async (req: Request, res: Response) => {
            const revertStatus: newStatusRequestModel = req.body;
            const response = await this.updateTrussStatus(revertStatus);
            res.send(response);
        }
    }
}