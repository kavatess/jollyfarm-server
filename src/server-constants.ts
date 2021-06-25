// AUTHENTICATION CONSTANTS
export const AUTH_TOKEN_SECRET = 'f64cd0b84ee1ba2252a40855a537f37d31c6e75dac5c46653f1920975a53cf153cf70f703141c944e2544a8bcaab9f2a0960646ad7035e15cab05c42f1d5aadc';
export const REFRESH_TOKEN_SECRET = '345e65f942e05307678792d659b685552f59af81ddd38f5bbc4b15b5341fd8dabc55441064735f02de320f1f34f24e6e921b077f1f18d66f452a120dffe3eb5a';
export const EMPLOYEE_AUTH_ARR = [
    "update-truss",
    "clear-truss",
    "create-truss",
    "update-seed",
    "delete-seed",
    "insert-seed",
    "change-password"
];
export enum AUTH_ROLES {
    ADMIN = 'admin',
    EMPLOYEE = 'employee'
};
// REQUEST START ROUTE
export const AUTH_ROUTE_BEGIN = '/api/auth';
export const API_ROUTE_BEGIN = '/api/v1';
// DATABASE NAME
export enum DATABASE {
    FARM = 'farm-database',
    STORAGE = 'storage-database',
    AUTHENTICATION = 'authentication-database'
};
// COLLECTION NAME
export enum COLLECTION {
    TRUSS = 'best-truss',
    PLANT = 'plant',
    SEED = 'seed',
    HISTORY = 'history',
    TRUSS_RECORD = 'truss-record',
    USER_INFO = 'user-info'
};
// COMMON AGGREGATION METHOD
export const MERGE_PLANT_LOOKUP_AGGREGATION = [
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