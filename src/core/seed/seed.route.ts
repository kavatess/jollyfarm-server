import * as express from "express";
import { Router, Request, Response } from "express";
import { API_ROUTE_BEGIN } from "../../server-constants";
import { handleInvalidRequestError } from "../../shared/error-handler.service";
import { BasicSeedModel } from "./models/seed.model";
import { UpdateSeedRequestBody } from "./models/update-seed-body-request.model";
import { deleteManySeedById, deleteOneSeedById } from "./services/delete-seed.service";
import { getSeedArr } from "./services/get-seed-data.service";
import { insertManySeed } from "./services/insert-seed.service";
import { updateSeedNumber } from "./services/update-seed.service";

export const SeedRouter: Router = express.Router();

SeedRouter.post(API_ROUTE_BEGIN + '/seed', async (_req: Request, res: Response) => {
    try {
        const seedArr = await getSeedArr();
        res.json(seedArr);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

SeedRouter.post(API_ROUTE_BEGIN + '/seed/update', async (req: Request, res: Response) => {
    try {
        const { _id, plantNumber }: UpdateSeedRequestBody = req.body;
        const response = await updateSeedNumber(_id, plantNumber);
        res.send(response);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

SeedRouter.post(API_ROUTE_BEGIN + '/seed/insert', async (req: Request, res: Response) => {
    try {
        const addedSeedArr: BasicSeedModel[] = req.body;
        const response = await insertManySeed(addedSeedArr);
        res.send(response);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

SeedRouter.post(API_ROUTE_BEGIN + '/seed/delete', async (req: Request, res: Response) => {
    try {
        const seedIdArr: string[] = req.body.idArr;
        const response = await deleteManySeedById(seedIdArr);
        res.send(response);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

SeedRouter.post(API_ROUTE_BEGIN + '/seed/remove/:id', async (req: Request, res: Response) => {
    try {
        const deletedSeedId: string = req.params.id;
        const response = await deleteOneSeedById(deletedSeedId);
        res.send(response);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});