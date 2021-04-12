import * as express from "express";
import { Router, Request, Response } from "express";
import { REQUEST_URL_HEAD } from "../../server-constants";
import { Seed } from "../seed/seed.model";
import SeedStorageService from './seed-storage.service';

export const SeedStorageRouter: Router = express.Router();

SeedStorageRouter.post(REQUEST_URL_HEAD + '/seed/storage/insert', async (req: Request, res: Response) => {
    const addedSeedArr: Seed[] = req.body;
    const response = await SeedStorageService.insertManySeed(addedSeedArr);
    res.send(response);
});