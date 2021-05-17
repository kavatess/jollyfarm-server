export const DB_URI = 'mongodb+srv://kavatess:2306@cluster0.gfleb.mongodb.net/test?retryWrites=true&w=majority';
export const DB_CONNECT_OPTIONS = { useNewUrlParser: true, useUnifiedTopology: true };
export const MAIN_DATABASE = 'farm-database';
export const STORAGE_DATABASE = 'data-storage';
export const TRUSS_COLLECTION = 'best-truss';
export const PLANT_COLLECTION = 'plant';
export const SEED_COLLECTION = 'seed';
export const HISTORY_COLLECTION = 'history';
export const SEED_STORAGE_COLLECTION = 'seed-nursery-storage';
export const REQUEST_URL_HEAD = '/api/v1';
export const PLANT_MERGE_LOOKUP_AGGREGATION = [
    {
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
    {
        $project: { fromItems: 0 }
    }
];
export const PLANT_LOOKUP_AGGREGATION = [
    {
        $lookup: {
            from: "plant",
            localField: "plantId",
            foreignField: "_id",
            as: "fromItems"
        }
    },
    {
        $addFields: { plantType: { $arrayElemAt: ["$fromItems", 0] } }
    },
    {
        $project: { fromItems: 0 }
    }
];