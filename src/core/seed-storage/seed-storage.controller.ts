import * as express from "express";
import { Router, Request, Response } from "express";
import { SEED_REQUEST_HEAD, SEED_REQUEST_TAIL } from "../../server-constants";
import { Seed } from "../seed/seed.model";
import { seedStorageService } from "./seed-storage.service";

export class seedStorageController extends seedStorageService {
    router: Router = express.Router();
    constructor() {
        super();
        this.router.post(SEED_REQUEST_HEAD + SEED_REQUEST_TAIL.saveSeedInStorage, this.insertSeedService());
    }
    private insertSeedService() {
        return async (req: Request, res: Response) => {
            const addedSeedArr: Seed[] = req.body;
            const response = await this.insertMany(addedSeedArr);
            res.send(response);
        }
    }
}