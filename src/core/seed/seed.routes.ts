import * as express from "express";
import { Router, Request, Response } from "express";
import { SEED_REQUEST } from "../../server-constants";
import { SeedModel, updateSeedRequest } from "./seed.model";
import SeedService from "./seed.services";

export const SeedRouter: Router = express.Router();

SeedRouter.post(SEED_REQUEST.getSeedData, async (_req: Request, res: Response) => {
    const seedArr = await SeedService.getSeedData();
    res.json(seedArr);
});

SeedRouter.post(SEED_REQUEST.updateOneSeed, async (req: Request, res: Response) => {
    const newSeed: updateSeedRequest = req.body;
    const response = await SeedService.updateSeedNumber(newSeed);
    res.send(response);
});

SeedRouter.post(SEED_REQUEST.insertManySeed, async (req: Request, res: Response) => {
    const addedSeedArr: SeedModel[] = req.body;
    const response = await SeedService.insertManySeed(addedSeedArr);
    res.send(response);
});

SeedRouter.post(SEED_REQUEST.deleteManySeed, async (req: Request, res: Response) => {
    const seedIdArr: string[] = req.body.idArr;
    const response = await SeedService.deleteManySeedById(seedIdArr);
    res.send(response);
});

SeedRouter.post(SEED_REQUEST.deleteOneSeed, async (req: Request, res: Response) => {
    const deletedSeedId: string = req.params.id;
    const response = await SeedService.deleteOneSeedById(deletedSeedId);
    res.send(response);
});