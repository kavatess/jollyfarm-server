import * as express from "express";
import { Router, Request, Response } from "express";
import { Seed, SeedExtended } from "./seed.model";
import { seedService } from "./seed.service";

export class seedController extends seedService {
    private seedData: SeedExtended[] = [];
    router: Router = express.Router();
    constructor() {
        super();
        this.router.post('/seed', this.getSeedDataController());
        this.router.post('/seed/insert', this.insertSeedController());
        this.router.post('/seed/delete', this.deleteSeedController());
        this.router.post('/seed/update/number', this.updateSeedController());
        this.router.post('/seed/remove', this.deleteSeedWhenCreateTruss());
    }

    private async getSeedData(): Promise<Seed[]> {
        if (!this.seedData.length) {
            this.seedData = await this.joinWithPlantData();
        }
        return this.seedData;
    }

    private async resetSeedData() {
        this.seedData = [];
        await this.getSeedData();
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
            const response = await this.deleteMany(seedIdArr);
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
            const response = await this.deleteOne(deletedSeedId);
            await this.resetSeedData();
            res.send(response);
        }
    }
}