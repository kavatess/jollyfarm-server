import { Collection, Db, ObjectId } from "mongodb";
import { mongoDatabase } from "./connect.mongodb";

export class mongoDB_Collection {
    private collection!: Collection;

    protected constructor(private dbName: string, private colName: string) {
        this.getCollection();
    }

    protected async getCollection() {
        if (!this.collection) {
            const db: Db = await mongoDatabase.getDatabase(this.dbName);
            this.collection = db.collection(this.colName);
        }
        return this.collection;
    }

    protected async findOneDocument(findCond: any) {
        try {
            await this.getCollection();
            return await this.collection.findOne(findCond);
        } catch (err) {
            console.log(err);
        }
    }

    protected async getDocumentById(id: string) {
        await this.getCollection();
        const findCond = { _id: new ObjectId(id) };
        return await this.findOneDocument(findCond);
    }

    protected async getDocumentWithCond(findCond = {}): Promise<any[]> {
        try {
            await this.getCollection();
            return await this.collection.find(findCond).toArray();
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    protected async insertOne(obj: any) {
        try {
            await this.getCollection();
            return await this.collection.insertOne(obj);
        } catch (err) {
            console.log(err);
        }
    }

    protected async insertMany(objArr: any[]) {
        try {
            await this.getCollection();
            return await this.collection.insertMany(objArr);
        } catch (err) {
            console.log(err);
        }
    }

    protected async deleteOneById(deletedObjId: string) {
        try {
            await this.getCollection();
            const deleteCond = { _id: new ObjectId(deletedObjId) };
            return await this.collection.deleteOne(deleteCond);
        } catch (err) {
            console.log(err);
        }
    }

    protected async deleteManyByIdArr(deletedObjIdArr: string[]) {
        try {
            await this.getCollection();
            const deletedIdArr = deletedObjIdArr.map(id => new ObjectId(id));
            const deleteCond = { _id: { $in: deletedIdArr } };
            return await this.collection.deleteMany(deleteCond);
        } catch (err) {
            console.log(err);
        }
    }

    protected async updateOne(updatedObjId: string, updateVal: any) {
        try {
            await this.getCollection();
            const findCond = { _id: new ObjectId(updatedObjId) };
            return await this.collection.updateOne(findCond, updateVal);
        } catch (err) {
            console.log(err);
        }
    }

    protected async joinWithPlantData(): Promise<any[]> {
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
            { $project: { fromItems: 0, plantId: 0 } }]
            return await this.collection.aggregate(aggregateMethod).toArray();
        } catch (err) {
            console.log(err);
            return [];
        }
    }
}