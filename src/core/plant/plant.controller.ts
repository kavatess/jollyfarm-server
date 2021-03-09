import * as express from "express";
import { Router, Request, Response } from "express";
import { plantModel } from "./plant.model";
import { plantService } from "./plant.service";

export class plantController extends plantService {
    router: Router = express.Router();
    constructor() {
        super();
        this.router.post('/plant', this.getPlantDataController());
        this.router.post('/plant/update', this.updatePlantController());
        this.router.post('/plant/insert', this.insertPlantController());
        this.router.post('/plant/delete', this.deletePlantController());
    }
    private getPlantDataController() {
        return async (req: Request, res: Response) => {
            const plantArr = await this.getDataFromCollection();
            res.send(plantArr);
        }
    }
    private updatePlantController() {
        return async (req: Request, res: Response) => {
            const plant: plantModel = req.body;
            const response = await this.updatePlant(plant);
            res.send(response);
        }
    }
    private insertPlantController() {
        return async (req: Request, res: Response) => {
            const newPlant: plantModel = req.body;
            const response = await this.insertOne(newPlant);
            res.send(response);
        }
    }
    private deletePlantController() {
        return async (req: Request, res: Response) => {
            const plantObjId: string = req.body;
            const response = await this.deleteOne(plantObjId);
            res.send(response);
        }
    }
}