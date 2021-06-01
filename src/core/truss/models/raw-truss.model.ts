import { PlantModel } from "../../plant/models/plant.model";
import { Status } from "./status.model";

export interface RawTrussModel {
    _id: string;
    block: string;
    index: number;
    maxHole: number;
    plantId: string;
    startDate: string;
    realStatus: Status[];
    plantType?: PlantModel;
}