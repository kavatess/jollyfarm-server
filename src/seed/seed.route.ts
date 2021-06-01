import * as express from "express";
import { Router, Request, Response } from "express";
import { API_ROUTE_BEGIN } from "../server-constants";
import { BasicSeedModel, UpdateSeedRequest } from "./models/seed.model";
import { SeedService } from "./services/seed.service";

export const SeedRouter: Router = express.Router();

SeedRouter.post(API_ROUTE_BEGIN + '/seed', async (_req: Request, res: Response) => {
    const seedArr = await SeedService.getSeedData();
    res.json(seedArr);
});

SeedRouter.post(API_ROUTE_BEGIN + '/seed/update', async (req: Request, res: Response) => {
    const newSeed: UpdateSeedRequest = req.body;
    const response = await SeedService.updateSeedNumber(newSeed._id, newSeed.plantNumber);
    res.send(response);
});

SeedRouter.post(API_ROUTE_BEGIN + '/seed/insert', async (req: Request, res: Response) => {
    const addedSeedArr: BasicSeedModel[] = req.body;
    const response = await SeedService.insertManySeed(addedSeedArr);
    res.send(response);
});

SeedRouter.post(API_ROUTE_BEGIN + '/seed/delete', async (req: Request, res: Response) => {
    const seedIdArr: string[] = req.body.idArr;
    const response = await SeedService.deleteManySeedById(seedIdArr);
    res.send(response);
});

SeedRouter.post(API_ROUTE_BEGIN + '/seed/remove/:id', async (req: Request, res: Response) => {
    const deletedSeedId: string = req.params.id;
    const response = await SeedService.deleteOneSeedById(deletedSeedId);
    res.send(response);
});