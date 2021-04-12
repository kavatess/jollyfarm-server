import { MongoDB_Collection } from "../../configs/collection-access.mongodb";
import { SEED_STORAGE_COLLECTION, STORAGE_DATABASE } from "../../server-constants";
import { Seed } from "../seed/seed.model";

const seedStorageCollection = new MongoDB_Collection(STORAGE_DATABASE, SEED_STORAGE_COLLECTION);

class SeedStorageService {
    constructor() { }

    async insertManySeed(newSeedArr: Seed[]) {
        return await seedStorageCollection.insertMany(newSeedArr);
    }
}

export default new SeedStorageService();