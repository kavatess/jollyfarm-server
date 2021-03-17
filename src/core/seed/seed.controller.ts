import * as express from "express";
import { Router, Request, Response } from "express";
import { Seed } from "./seed.model";
import { seedService } from "./seed.service";

class SeedController extends seedService {
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
            const seedArr = await this.getSeedData();
            res.send(seedArr);
        }
    }

    private insertSeedController() {
        return async (req: Request, res: Response) => {
            const addedSeedArr: Seed[] = req.body;
            const response = await this.insertMany(addedSeedArr);
            await this.resetSeedData();
            res.send(response);
        }
    }

    private deleteSeedController() {
        return async (req: Request, res: Response) => {
            const seedIdArr: string[] = req.body.idArr;
            const response = await this.deleteManyByIdArr(seedIdArr);
            await this.resetSeedData();
            res.send(response);
        }
    }

    private updateSeedController() {
        return async (req: Request, res: Response) => {
            const newSeed: Seed = req.body;
            const response = await this.updateSeedNumber(newSeed);
            await this.resetSeedData();
            res.send(response);
        }
    }

    private deleteSeedWhenCreateTruss() {
        return async (req: Request, res: Response) => {
            const deletedSeedId: string = req.body.createdSeedId;
            const response = await this.deleteOneById(deletedSeedId);
            await this.resetSeedData();
            res.send(response);
        }
    }
}

export default new SeedController();