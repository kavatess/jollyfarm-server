import { PlantModel } from "../../plant/models/plant.model";
import { BasicHistory } from "./basic-history.model";

export interface ResponseHistoryModel extends BasicHistory, PlantModel {
}