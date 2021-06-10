import { ObjectId } from "bson";

export class NewRecord {
    harvestedTrussId: ObjectId;
    plantId: ObjectId;
    date: Date = new Date();
    harvestNumber: number;
    constructor(harvestedTrussId: string, plantId: string, harvestNumber: number) {
        this.harvestedTrussId = new ObjectId(harvestedTrussId);
        this.plantId = new ObjectId(plantId);
        this.harvestNumber = Number(harvestNumber);
    }
}

export interface Record {
    _id: string;
    harvestedTrussId: string;
    plantId: string;
    date: Date;
    harvestNumber: number;
}

export interface HarvestStatByDate {
    date: string;
    harvestNumber: number;
}

// export class Record {
//     private _id: string;
//     private _harvestedTrussId: ObjectId;
//     private _plantId: ObjectId;
//     private _date: Date;
//     private _harvestNumber: number;
//     private _plantType: Plant;
//     constructor(record: RecordModel) {
//         this._id = record._id;
//         this._harvestedTrussId = record.harvestedTrussId;
//         this._plantId = record.plantId;
//         this._date = new Date(record.date);
//         this._harvestNumber = Number(record.harvestNumber);
//         this._plantType = new Plant(record.plantType);
//     }
//     get id(): string {
//         return this._id;
//     }
//     get harvestedTrussId(): ObjectId {
//         return this._harvestedTrussId;
//     }
//     get plantId(): ObjectId {
//         return this._plantId;
//     }
//     get date(): Date {
//         return this._date
//     }
//     get harvestNumber(): number {
//         return this._harvestNumber;
//     }
//     get plantType(): Plant {
//         return this._plantType;
//     }
//     setRecordId(newId: string): void {
//         this._id = newId;
//     }
//     set
// }