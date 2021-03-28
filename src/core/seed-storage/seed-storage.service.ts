import { mongoDB_Collection } from "../../configs/collection-access.mongodb";
import { SEED_STORAGE_COLLECTION, STORAGE_DATABASE } from "../../server-constants";

export class seedStorageService extends mongoDB_Collection {
    protected constructor() {
        super(STORAGE_DATABASE, SEED_STORAGE_COLLECTION);
    }
}