import { Plant } from '../../plant/models/plant.model';

export class Statistic {
    plantName: string;
    plantColor: string;
    plantNumber: number;
    numberPerKg: number;
    constructor(plantType: Plant, plantNumber: number) {
        this.plantName = plantType.getPlantName();
        this.plantColor = plantType.getPlantColor();
        this.plantNumber = Number(plantNumber);
        this.numberPerKg = plantType.getNumberPerKg();
    }
}