import * as express from "express";
import { Router, Request, Response } from "express";
import { SEED_STORAGE_REQUEST } from "../../server-constants";
import { Seed } from "../seed/seed.model";
import SeedStorageService from './seed-storage.service';

export const SeedStorageRouter: Router = express.Router();

SeedStorageRouter.post(SEED_STORAGE_REQUEST.storeManySeed, async (req: Request, res: Response) => {
    const addedSeedArr: Seed[] = req.body;
    const response = await SeedStorageService.insertManySeed(addedSeedArr);
    res.send(response);
});