import { mongoDB_Collection } from "../../configs/collection-access.mongodb";
import { mongoDatabase } from "../../configs/connect.mongodb";

export class seedStorageService extends mongoDB_Collection {
    protected constructor() {
        super(mongoDatabase.getStorageDB(), "seed-nursery-storage");
    }
}