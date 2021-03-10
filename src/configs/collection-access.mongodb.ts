import { Collection, Db, ObjectId, CollectionAggregationOptions } from "mongodb";

export class mongoDB_Collection {
    private collection!: Collection;
    protected constructor(private database: Promise<Db>, private colName: string) {
        this.getCollection();
    }
    protected async getCollection() {
        if (!this.collection) {
            const db = await this.database;
            this.collection = db.collection(this.colName);
        }
        return this.collection;
    }
    protected async getDataFromCollection(findCond = {}) {
        try {
            const collection = await this.getCollection();
            return await collection.find(findCond).toArray();
        } catch (err) {
            console.log(err);
            return new Error(err);
        }
    }
    protected async insertOne(obj: any) {
        try {
            const collection = await this.getCollection();
            return await collection.insertOne(obj);
        } catch (err) {
            console.log(err);
            return new Error(err);
        }
    }
    protected async insertMany(objArr: any[]) {
        try {
            const collection = await this.getCollection();
            return await collection.insertMany(objArr);
        } catch (err) {
            console.log(err);
            return new Error(err);
        }
    }
    protected async deleteOne(deletedObjId: string) {
        try {
            const collection = await this.getCollection();
            const deleteCond = { _id: new ObjectId(deletedObjId) };
            return await collection.deleteOne(deleteCond);
        } catch (err) {
            console.log(err);
            return new Error(err);
        }
    }
    protected async deleteMany(deletedObjIdArr: string[]) {
        try {
            const collection = await this.getCollection();
            const deletedIdArr = deletedObjIdArr.map(id => new ObjectId(id));
            const deleteCond = { _id: { $in: deletedIdArr } };
            return await collection.deleteMany(deleteCond);
        } catch (err) {
            console.log(err);
            return new Error(err);
        }
    }
    protected async updateOne(updatedObjId: string, updateVal: any) {
        try {
            const collection = await this.getCollection();
            const findCond = { _id: new ObjectId(updatedObjId) };
            return await collection.updateOne(findCond, updateVal);
        } catch (err) {
            console.log(err);
            return new Error(err);
        }
    }
    protected async lookUpMultipleData(aggregateMethod: any) {
        try {
            const collection = await this.getCollection();
            return await collection.aggregate(aggregateMethod).toArray();
        } catch (err) {
            console.log(err);
            return new Error(err);
        }
    }
}