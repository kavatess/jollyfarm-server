import * as express from "express";
import { Router, Request, Response } from "express";
import { REQUEST_URL_HEAD } from "../../server-constants";
import { PlantModel } from "./plant.model";
import PlantService from "./plant.services";

export const PlantRouter: Router = express.Router();

PlantRouter.post(REQUEST_URL_HEAD + '/plant', async (_req: Request, res: Response) => {
    const plantArr = await PlantService.getPlantData();
    res.send(plantArr);
});

PlantRouter.post(REQUEST_URL_HEAD + '/plant/update', async (req: Request, res: Response) => {
    const plant: PlantModel = req.body;
    const response = await PlantService.updatePlant(plant);
    res.send(response);
});

PlantRouter.post(REQUEST_URL_HEAD + '/plant/insert', async (req: Request, res: Response) => {
    const newPlant: PlantModel = req.body;
    const response = await PlantService.insertOnePlant(newPlant);
    res.send(response);
});

PlantRouter.post(REQUEST_URL_HEAD + '/plant/delete', async (req: Request, res: Response) => {
    const plantObjId: string = req.params.id;
    const response = await PlantService.deleteOnePlantById(plantObjId);
    res.send(response);
});

export async function getPlantType(plantId: number) {
    return await PlantService.getPlantInfo(plantId);
}