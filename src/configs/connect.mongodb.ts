import mongodb, { Db, MongoClient } from "mongodb";

export class mongoDatabase {
    private static url: string = "mongodb+srv://kavatess:2306@cluster0.gfleb.mongodb.net/test?retryWrites=true&w=majority";
    private static mongodb: MongoClient;
    private constructor() {
    }
    
    private static async connect() {
        try {
            return await mongodb.connect(mongoDatabase.url, { useNewUrlParser: true, useUnifiedTopology: true });
        } catch (err) {
            console.log(err);
            process.exit();
        }
    }
    private static async dbConnection() {
        if (!mongoDatabase.mongodb) {
            console.log(`Establishing database connection...`);
            mongoDatabase.mongodb = await this.connect();
            console.log(`Database connection established successfully.`);
        }
        return mongoDatabase.mongodb;
    }
    public static async getDatabase(dbName: string): Promise<Db> {
        const mongoDB = await this.dbConnection();
        return mongoDB.db(dbName);
    }
}