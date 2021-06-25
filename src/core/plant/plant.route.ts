import * as express from "express";
import { Router, Request, Response } from "express";
import { API_ROUTE_BEGIN } from "../../server-constants";
import { handleInvalidRequestError } from "../../shared/services/error-handler.service";
import { PlantModel } from "./models/plant.model";
import { deleteOnePlantById } from "./services/delete-plant.service";
import { getPlantArr } from './services/get-plant-data.service';
import { insertOnePlant } from "./services/insert-plant.service";
import { updatePlant } from "./services/update-plant.service";

export const PlantRouter: Router = express.Router();

PlantRouter.post(API_ROUTE_BEGIN + '/plant', async (_req: Request, res: Response) => {
    try {
        const plantArr = await getPlantArr();
        res.json(plantArr);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

PlantRouter.post(API_ROUTE_BEGIN + '/plant/update', async (req: Request, res: Response) => {
    try {
        const plant: PlantModel = req.body;
        const response = await updatePlant(plant);
        res.json(response);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

PlantRouter.post(API_ROUTE_BEGIN + '/plant/insert', async (req: Request, res: Response) => {
    try {
        const newPlant: PlantModel = req.body;
        const response = await insertOnePlant(newPlant);
        res.json(response);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

PlantRouter.post(API_ROUTE_BEGIN + '/plant/delete/:id', async (req: Request, res: Response) => {
    try {
        const plantObjId: string = req.params.id || '';
        const response = await deleteOnePlantById(plantObjId);
        res.json(response);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});