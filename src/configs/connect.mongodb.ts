import mongodb, { Db } from "mongodb";

export class mongoDatabase {
    private static url: string = "mongodb+srv://kavatess:2306@cluster0.gfleb.mongodb.net/test?retryWrites=true&w=majority";
    private static db: Db;
    private static storageDB: Db;
    private constructor() { }
    private static async connect(dbName: string) {
        try {
            const database = await mongodb.connect(mongoDatabase.url, { useNewUrlParser: true, useUnifiedTopology: true });
            return database.db(dbName);
        } catch (err) {
            console.log(err);
            process.exit();
        }
    }
    public static async getDB() {
        if (!mongoDatabase.db) {
            console.log(`Establishing database connection...`);
            mongoDatabase.db = await mongoDatabase.connect("farm-database");
            console.log(`Database connection established successfully.`);
        }
        return mongoDatabase.db;
    }
    public static async getStorageDB() {
        if (!mongoDatabase.storageDB) {
            console.log(`Establishing storage database connection...`);
            mongoDatabase.storageDB = await this.connect("data-storage");
            console.log(`Storage database connection established successfully.`);
        }
        return mongoDatabase.storageDB;
    }
}