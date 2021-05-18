import mongodb, { Db, MongoClient } from "mongodb";
import { DB_URI } from '../server-constants';

export class MongoDatabase {
    private static mongoDB: MongoClient;
    private constructor() {
        MongoDatabase.dbConnection();
    }
    private static async connect() {
        try {
            return await mongodb.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        } catch (err) {
            console.log(err);
            process.exit();
        }
    }
    private static async dbConnection() {
        if (!MongoDatabase.mongoDB) {
            console.log(`Establishing database connection...`);
            MongoDatabase.mongoDB = await this.connect();
            console.log(`Database connection established successfully.`);
        }
        return MongoDatabase.mongoDB;
    }
    public static async getDatabase(dbName: string): Promise<Db> {
        const mongoDB = await this.dbConnection();
        return mongoDB.db(dbName);
    }
}