import { trussService } from "./truss.service";
import { Router, Request, Response } from "express";
import * as express from "express";
import { Truss, TrussExtended } from "./truss.model";

export class trussController extends trussService {
    private trussData: TrussExtended[] = [];
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

    private async getTrussData(): Promise<TrussExtended[]> {
        if (!this.trussData.length) {
            this.trussData = await this.joinWithPlantData();
        }
        return this.trussData;
    }

    private async resetTrussData() {
        this.trussData = [];
        await this.getTrussData();
    }

    private getTrussController() {
        return async (_req: Request, res: Response) => {
            const trussArr = await this.getTrussData();
            res.send(trussArr);
        }
    }

    private updateTrussStatusController() {
        return async (req: Request, res: Response) => {
            const newStatusTruss = req.body;
            const response = await this.updateTrussStatus(newStatusTruss);
            await this.resetTrussData();
            res.send(response);
        }
    }
    
    private createNewTrussController() {
        return async (req: Request, res: Response) => {
            const newTruss: Truss = req.body;
            const response = await this.createNewTruss(newTruss);
            await this.resetTrussData();
            res.send(response);
        }
    }

    private clearTrussController() {
        return async (req: Request, res: Response) => {
            const truss: Truss = req.body;
            const response = await this.clearTruss(truss);
            await this.resetTrussData();
            res.send(response);
        }
    }

    private updateTrussMaxHoleController() {
        return async (req: Request, res: Response) => {
            const newMaxHole = req.body;
            const response = await this.updateTrussMaxHole(newMaxHole);
            await this.resetTrussData();
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
}