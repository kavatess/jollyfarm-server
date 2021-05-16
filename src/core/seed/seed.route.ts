import * as express from "express";
import { Router, Request, Response } from "express";
import { REQUEST_URL_HEAD } from "../../server-constants";
import { SeedModel, UpdateSeedRequest } from "./seed.model";
import SeedService from "./seed.service";

export const SeedRouter: Router = express.Router();

SeedRouter.post(REQUEST_URL_HEAD + '/seed', async (_req: Request, res: Response) => {
    const seedArr = await SeedService.getSeedData();
    res.json(seedArr);
});

SeedRouter.post(REQUEST_URL_HEAD + '/seed/update', async (req: Request, res: Response) => {
    const newSeed: UpdateSeedRequest = req.body;
    const response = await SeedService.updateSeedNumber(newSeed._id, newSeed.plantNumber);
    res.send(response);
});

SeedRouter.post(REQUEST_URL_HEAD + '/seed/insert', async (req: Request, res: Response) => {
    const addedSeedArr: SeedModel[] = req.body;
    const response = await SeedService.insertManySeed(addedSeedArr);
    res.send(response);
});

SeedRouter.post(REQUEST_URL_HEAD + '/seed/delete', async (req: Request, res: Response) => {
    const seedIdArr: string[] = req.body.idArr;
    const response = await SeedService.deleteManySeedById(seedIdArr);
    res.send(response);
});

SeedRouter.post(REQUEST_URL_HEAD + '/seed/remove/:id', async (req: Request, res: Response) => {
    const deletedSeedId: string = req.params.id;
    const response = await SeedService.deleteOneSeedById(deletedSeedId);
    res.send(response);
});