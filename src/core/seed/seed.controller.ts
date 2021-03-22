import * as express from "express";
import { Router, Request, Response } from "express";
import { DELETE_REQUEST, INSERT_REQUEST, SEED_REQUEST_HEAD, SEED_REQUEST_TAIL, UPDATE_REQUEST } from "../../server-constants";
import { Seed, updateSeedRequest } from "./seed.model";
import { seedService } from "./seed.service";

class SeedController extends seedService {
    router: Router = express.Router();

    constructor() {
        super();
        this.router.post(SEED_REQUEST_HEAD, this.getSeedDataController());
        this.router.post(SEED_REQUEST_HEAD + INSERT_REQUEST, this.insertSeedController());
        this.router.post(SEED_REQUEST_HEAD + DELETE_REQUEST, this.deleteSeedController());
        this.router.post(SEED_REQUEST_HEAD + UPDATE_REQUEST, this.updateSeedController());
        this.router.post(SEED_REQUEST_HEAD + SEED_REQUEST_TAIL.removeSeedAfterCreatedTruss, this.deleteSeedWhenCreateTruss());
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
            const newSeed: updateSeedRequest = req.body;
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