import { mongoDB_Collection } from "../../configs/collection-access.mongodb";

export class seedStorageService extends mongoDB_Collection {
    protected constructor() {
        super("data-storage", "seed-nursery-storage");
    }
}