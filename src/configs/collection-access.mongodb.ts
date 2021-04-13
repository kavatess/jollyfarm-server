import { Collection, Db, ObjectId } from "mongodb";
import { MongoDatabase } from "./connect.mongodb";

export class MongoDB_Collection {
    private collection!: Collection;

    constructor(private dbName: string, private colName: string) {
        this.getCollection();
    }

    async getCollection() {
        if (!this.collection) {
            const db: Db = await MongoDatabase.getDatabase(this.dbName);
            this.collection = db.collection(this.colName);
        }
        return this.collection;
    }

    async getDocumentById(id: string) {
        try {
            await this.getCollection();
            const findCond = { _id: new ObjectId(id) };
            return await this.collection.findOne(findCond);
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    async getDocumentWithCond(findCond = {}): Promise<any[]> {
        try {
            await this.getCollection();
            return await this.collection.find(findCond).toArray();
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    async insertOne(obj: any) {
        try {
            await this.getCollection();
            return await this.collection.insertOne(obj);
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    async insertMany(objArr: any[]) {
        try {
            await this.getCollection();
            return await this.collection.insertMany(objArr);
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    async deleteOneById(deletedObjId: string) {
        try {
            await this.getCollection();
            const deleteCond = { _id: new ObjectId(deletedObjId) };
            console.log(deleteCond);
            return await this.collection.deleteOne(deleteCond);
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    async deleteManyByIdArr(deletedObjIdArr: string[]) {
        try {
            await this.getCollection();
            const deletedIdArr = deletedObjIdArr.map(id => new ObjectId(id));
            const deleteCond = { _id: { $in: deletedIdArr } };
            return await this.collection.deleteMany(deleteCond);
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    async updateOne(updatedObjId: string, updateVal: any) {
        try {
            await this.getCollection();
            const findCond = { _id: new ObjectId(updatedObjId) };
            return await this.collection.updateOne(findCond, updateVal);
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    async updateOneWithHardCond(condObj: any, updateObj: any) {
        try {
            await this.getCollection();
            return await this.collection.updateOne(condObj, updateObj);
        } catch (err) {
            console.log(err);
            return err;
        }
    }

    async joinWithPlantData(): Promise<any[]> {
        try {
            await this.getCollection();
            const aggregateMethod = [{
                $lookup: {
                    from: "plant",
                    localField: "plantId",
                    foreignField: "_id",
                    as: "fromItems"
                }
            },
            {
                $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$fromItems", 0] }, "$$ROOT"] } }
            },
            { $project: { fromItems: 0 } }]
            return await this.collection.aggregate(aggregateMethod).toArray();
        } catch (err) {
            console.log(err);
            return [];
        }
    }
}