export const DB_URI = 'mongodb+srv://kavatess:2306@cluster0.gfleb.mongodb.net/test?retryWrites=true&w=majority';
// AUTHENTICATION_TOKEN
export const AUTH_TOKEN_SECRET = 'f64cd0b84ee1ba2252a40855a537f37d31c6e75dac5c46653f1920975a53cf153cf70f703141c944e2544a8bcaab9f2a0960646ad7035e15cab05c42f1d5aadc';
export const REFRESH_TOKEN_SECRET = '345e65f942e05307678792d659b685552f59af81ddd38f5bbc4b15b5341fd8dabc55441064735f02de320f1f34f24e6e921b077f1f18d66f452a120dffe3eb5a';
// DATABASE NAME
export const MAIN_DATABASE = 'farm-database';
export const STORAGE_DATABASE = 'data-storage';
export const AUTHENTICATION_DATABASE = 'authentication-database';
// COLLECTION NAME
export const TRUSS_COLLECTION = 'best-truss';
export const PLANT_COLLECTION = 'plant';
export const SEED_COLLECTION = 'seed';
export const HISTORY_COLLECTION = 'history';
export const SEED_STORAGE_COLLECTION = 'seed-nursery-storage';
export const USER_INFO_COLLECTION = 'user-info';
export const AUTH_REQUEST_URL_BEGIN = '/api/auth';
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