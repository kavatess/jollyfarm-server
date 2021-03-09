import * as express from "express";
import { Router, Request, Response } from "express";
import { seedModel } from "./seed.model";
import { seedService } from "./seed.service";

export class seedController extends seedService {
    router: Router = express.Router();
    constructor() {
        super();
        this.router.post('/seed', this.getSeedDataController());
        this.router.post('/seed/insert', this.insertSeedController());
        this.router.post('/seed/delete', this.deleteSeedController());
        this.router.post('/seed/update/number', this.updateSeedController());
        this.router.post('/seed/remove', this.deleteSeedWhenCreateTruss());
    }
    private getSeedDataController() {
        return async (_req: Request, res: Response) => {
            const seedArr = await this.getDataFromCollection();
            res.send(seedArr);
        }
    }
    private insertSeedController() {
        return async (req: Request, res: Response) => {
            const addedSeedArr: seedModel[] = req.body;
            const response = await this.insertMany(addedSeedArr);
            res.send(response);
        }
    }
    private deleteSeedController() {
        return async (req: Request, res: Response) => {
            const seedIdArr: string[] = req.body.idArr;
            const response = await this.deleteMany(seedIdArr);
            res.send(response);
        }
    }
    private updateSeedController() {
        return async (req: Request, res: Response) => {
            const newSeed: seedModel = req.body;
            const response = await this.updateSeedNumber(newSeed);
            res.send(response);
        }
    }
    private deleteSeedWhenCreateTruss() {
        return async (req: Request, res: Response) => {
            const deletedSeedId: string = req.body._id;
            const response = await this.deleteOne(deletedSeedId);
            res.send(response);
        }
    }
}