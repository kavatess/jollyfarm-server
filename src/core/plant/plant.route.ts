import * as express from "express";
import { Router, Request, Response } from "express";
import { API_ROUTE_BEGIN } from "../../server-constants";
import { PlantModel } from "./plant.model";
import { PlantService } from "./plant.service";

export const PlantRouter: Router = express.Router();

PlantRouter.post(API_ROUTE_BEGIN + '/plant', async (_req: Request, res: Response) => {
    const plantArr = await PlantService.getPlantData();
    res.send(plantArr);
});

PlantRouter.post(API_ROUTE_BEGIN + '/plant/update', async (req: Request, res: Response) => {
    const plant: PlantModel = req.body;
    const response = await PlantService.updatePlant(plant);
    res.send(response);
});

PlantRouter.post(API_ROUTE_BEGIN + '/plant/insert', async (req: Request, res: Response) => {
    const newPlant: PlantModel = req.body;
    const response = await PlantService.insertOnePlant(newPlant);
    res.send(response);
});

PlantRouter.post(API_ROUTE_BEGIN + '/plant/delete/:id', async (req: Request, res: Response) => {
    const plantObjId: string = req.params.id;
    const response = await PlantService.deleteOnePlantById(plantObjId);
    res.send(response);
});

export async function getPlantType(plantId: string) {
    return await PlantService.getPlantInfo(plantId);
}