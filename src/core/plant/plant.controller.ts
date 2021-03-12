import * as express from "express";
import { Router, Request, Response } from "express";
import { Plant, PlantModel } from "./plant.model";
import { plantService } from "./plant.service";

export class plantController extends plantService {
    private plantData: Plant[] = [];
    router: Router = express.Router();

    constructor() {
        super();
        this.router.post('/plant', this.getPlantDataController());
        this.router.post('/plant/update', this.updatePlantController());
        this.router.post('/plant/insert', this.insertPlantController());
        this.router.post('/plant/delete', this.deletePlantController());
    }

    private async getPlantData(): Promise<Plant[]> {
        if (!this.plantData.length) {
            this.plantData = await this.getDataFromCollection();
        }
        return this.plantData;
    }

    private async resetPlantData() {
        this.plantData = [];
        await this.getPlantData();
    }

    private getPlantDataController() {
        return async (_req: Request, res: Response) => {
            const plantArr = await this.getPlantData();
            res.send(plantArr);
        }
    }

    private updatePlantController() {
        return async (req: Request, res: Response) => {
            const plant: Plant = req.body;
            const response = await this.updatePlant(plant);
            await this.resetPlantData();
            res.send(response);
        }
    }

    private insertPlantController() {
        return async (req: Request, res: Response) => {
            const newPlant: PlantModel = req.body;
            const response = await this.insertOne(newPlant);
            await this.resetPlantData();
            res.send(response);
        }
    }

    private deletePlantController() {
        return async (req: Request, res: Response) => {
            const plantObjId: string = req.body;
            const response = await this.deleteOne(plantObjId);
            await this.resetPlantData();
            res.send(response);
        }
    }
}