import { Collection, Db, DeleteWriteOpResultObject, InsertOneWriteOpResult, InsertWriteOpResult, ObjectId, UpdateWriteOpResult } from "mongodb";
import { COLLECTION, DATABASE } from "../server-constants";
import { MongoDB_Connection } from "./mongodb-connection.config";

class MongoDB_Collection {
    private collection!: Collection;

    constructor(private dbName: string, private colName: string) {
        this.collectionInit();
    }

    public async collectionInit(): Promise<void> {
        if (!this.collection) {
            const db: Db = await MongoDB_Connection.getDatabase(this.dbName);
            this.collection = db.collection(this.colName);
        }
    }

    public async findOneById(id: string): Promise<any> {
        await this.collectionInit();
        const findCond = { _id: new ObjectId(id) };
        return await this.collection.findOne(findCond);
    }

    public async findAll(findCond = {}): Promise<any[]> {
        await this.collectionInit();
        return await this.collection.find(findCond).toArray();
    }

    public async insertOne(obj: any): Promise<InsertOneWriteOpResult<any>> {
        await this.collectionInit();
        return await this.collection.insertOne(obj);
    }

    public async insertMany(objArr: any[]): Promise<InsertWriteOpResult<any>> {
        await this.collectionInit();
        return await this.collection.insertMany(objArr);
    }

    public async deleteOneById(deletedObjId: string): Promise<DeleteWriteOpResultObject> {
        await this.collectionInit();
        const deleteCond = { _id: new ObjectId(deletedObjId) };
        return await this.collection.deleteOne(deleteCond);
    }

    public async deleteManyByIdArr(deletedObjIdArr: string[]): Promise<DeleteWriteOpResultObject> {
        await this.collectionInit();
        const deletedIdArr = deletedObjIdArr.map(id => new ObjectId(id));
        const deleteCond = { _id: { $in: deletedIdArr } };
        return await this.collection.deleteMany(deleteCond);
    }

    public async updateOneById(updatedObjId: string, updateVal: any): Promise<UpdateWriteOpResult> {
        const findCond = { _id: new ObjectId(updatedObjId) };
        return await this.updateOne(findCond, updateVal);
    }

    public async updateOne(condObj: any, updateObj: any): Promise<UpdateWriteOpResult> {
        await this.collectionInit();
        return await this.collection.updateOne(condObj, updateObj);
    }

    public async aggregate(lookUpMethod: any): Promise<any[]> {
        await this.collectionInit();
        return await this.collection.aggregate(lookUpMethod).toArray();
    }
}

export const TRUSS_COLLECTION = new MongoDB_Collection(DATABASE.FARM, COLLECTION.TRUSS);
export const PLANT_COLLECTION = new MongoDB_Collection(DATABASE.FARM, COLLECTION.PLANT);
export const SEED_COLLECTION = new MongoDB_Collection(DATABASE.FARM, COLLECTION.SEED);
export const SEED_STORAGE_COLLECTION = new MongoDB_Collection(DATABASE.STORAGE, COLLECTION.SEED);
export const HISTORY_COLLECTION = new MongoDB_Collection(DATABASE.FARM, COLLECTION.HISTORY);
export const RECORD_COLLECTION = new MongoDB_Collection(DATABASE.STORAGE, COLLECTION.TRUSS_RECORD);
export const USER_COLLECTION = new MongoDB_Collection(DATABASE.AUTHENTICATION, COLLECTION.USER_INFO);