import mongodb, { Db, MongoClient } from "mongodb";

export class MongoDB_Connection {
    private static mongoDB: MongoClient;
    private static readonly DB_CONNECT_URI = 'mongodb+srv://kavatess:2306@cluster0.gfleb.mongodb.net/test?retryWrites=true&w=majority';
    private constructor() { }
    private static async connect() {
        try {
            return await mongodb.connect(this.DB_CONNECT_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        } catch (err) {
            console.log(err);
            process.exit();
        }
    }
    private static async establishConnection() {
        if (!MongoDB_Connection.mongoDB) {
            console.log(`Establishing database connection...`);
            MongoDB_Connection.mongoDB = await this.connect();
            console.log(`Database connection established successfully.`);
        }
        return MongoDB_Connection.mongoDB;
    }
    public static async getDatabase(dbName: string): Promise<Db> {
        const mongoDB = await this.establishConnection();
        return mongoDB.db(dbName);
    }
}