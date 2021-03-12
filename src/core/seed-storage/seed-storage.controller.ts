import * as express from "express";
import { Router, Request, Response } from "express";
import { Seed } from "../seed/seed.model";
import { seedStorageService } from "./seed-storage.service";

export class seedStorageController extends seedStorageService {
    router: Router = express.Router();
    constructor() {
        super();
        this.router.post('/seed/storage/insert', this.insertSeedService());
    }
    private insertSeedService() {
        return async (req: Request, res: Response) => {
            const addedSeedArr: Seed[] = req.body;
            const response = await this.insertMany(addedSeedArr);
            res.send(response);
        }
    }
}