import { EmptyTruss, PlantingTruss, Truss, TrussModel } from "../truss.model";

export class BasicTrussFactory {
    createTruss(truss: TrussModel): Truss {
        if (!truss.plantId) {
            return new EmptyTruss(truss);
        }
        return new PlantingTruss(truss);
    }
}