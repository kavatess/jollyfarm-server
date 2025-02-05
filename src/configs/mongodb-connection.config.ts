import mongodb, { Db, MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export class MongoDB_Connection {
  private static mongoDB: MongoClient;
  private static readonly DB_CONNECT_URI =
    process.env.MONGODB_DATABASE_URI || "mongodb://localhost:27017";

  private constructor() {}

  private static async connect() {
    try {
      return await mongodb.connect(this.DB_CONNECT_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
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
