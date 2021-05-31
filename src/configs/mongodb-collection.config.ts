import { Collection, Db, ObjectId } from "mongodb";
import { MongoDB_Connection } from "./mongodb-connection.config";

export class MongoDB_Collection {
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

    public async findOneById(id: string) {
        try {
            await this.collectionInit();
            const findCond = { _id: new ObjectId(id) };
            return await this.collection.findOne(findCond);
        } catch (err) {
            console.log(err);
            return new Error(err);
        }
    }

    public async findAll(findCond = {}): Promise<any[]> {
        try {
            await this.collectionInit();
            return await this.collection.find(findCond).toArray();
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    public async insertOne(obj: any) {
        try {
            await this.collectionInit();
            return await this.collection.insertOne(obj);
        } catch (err) {
            console.log(err);
            return new Error(err);
        }
    }

    public async insertMany(objArr: any[]) {
        try {
            await this.collectionInit();
            return await this.collection.insertMany(objArr);
        } catch (err) {
            console.log(err);
            return new Error(err);
        }
    }

    public async deleteOneById(deletedObjId: string) {
        try {
            await this.collectionInit();
            const deleteCond = { _id: new ObjectId(deletedObjId) };
            console.log(deleteCond);
            return await this.collection.deleteOne(deleteCond);
        } catch (err) {
            console.log(err);
            return new Error(err);
        }
    }

    public async deleteManyByIdArr(deletedObjIdArr: string[]) {
        try {
            await this.collectionInit();
            const deletedIdArr = deletedObjIdArr.map(id => new ObjectId(id));
            const deleteCond = { _id: { $in: deletedIdArr } };
            return await this.collection.deleteMany(deleteCond);
        } catch (err) {
            console.log(err);
            return new Error(err);
        }
    }

    public async updateOneById(updatedObjId: string, updateVal: any) {
        try {
            const findCond = { _id: new ObjectId(updatedObjId) };
            return await this.updateOne(findCond, updateVal);
        } catch (err) {
            console.log(err);
            return new Error(err);
        }
    }

    public async updateOne(condObj: any, updateObj: any) {
        try {
            await this.collectionInit();
            return await this.collection.updateOne(condObj, updateObj);
        } catch (err) {
            console.log(err);
            return new Error(err);
        }
    }

    public async aggregate(lookUpMethod: any): Promise<any[]> {
        try {
            await this.collectionInit();
            return await this.collection.aggregate(lookUpMethod).toArray();
        } catch (err) {
            console.log(err);
            return [];
        }
    }
}