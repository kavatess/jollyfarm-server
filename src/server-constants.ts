const REQUEST_URL_HEAD = '/api/v1';
const TRUSS_REQUEST_HEAD = REQUEST_URL_HEAD + '/truss';
const PLANT_REQUEST_HEAD = REQUEST_URL_HEAD + '/plant';
const SEED_REQUEST_HEAD = REQUEST_URL_HEAD + '/seed';
const STORAGE_REQUEST = '/storage';
const UPDATE_REQUEST = '/update';
const INSERT_REQUEST = '/insert';
const DELETE_REQUEST = '/delete';
export const TRUSS_REQUEST = {
    getTrussData: TRUSS_REQUEST_HEAD + '/block/:block',
    getStatistics: TRUSS_REQUEST_HEAD + '/statistics',
    updateStatus: TRUSS_REQUEST_HEAD + '/update/status',
    createTruss: TRUSS_REQUEST_HEAD + '/create',
    clearTruss: TRUSS_REQUEST_HEAD + '/clear',
    updateMaxHole: TRUSS_REQUEST_HEAD + '/update/maxhole',
    revertStatus: TRUSS_REQUEST_HEAD + '/revert/status',
    getTimelineById: TRUSS_REQUEST_HEAD + '/timeline/:id'
}
export const PLANT_REQUEST = {
    getPlantData: PLANT_REQUEST_HEAD,
    updateOnePlant: PLANT_REQUEST_HEAD + UPDATE_REQUEST,
    insertOnePlant: PLANT_REQUEST_HEAD + INSERT_REQUEST,
    deleteOnePlant: PLANT_REQUEST_HEAD + DELETE_REQUEST,
}
export const SEED_REQUEST = {
    getSeedData: SEED_REQUEST_HEAD,
    updateOneSeed: SEED_REQUEST_HEAD + UPDATE_REQUEST,
    insertManySeed: SEED_REQUEST_HEAD + INSERT_REQUEST,
    deleteManySeed: SEED_REQUEST_HEAD + DELETE_REQUEST,
    deleteOneSeed: SEED_REQUEST_HEAD + '/remove',
}

export const MAIN_DATABASE = 'farm-database';
export const TRUSS_COLLECTION = 'truss-final';
export const PLANT_COLLECTION = 'plant';
export const SEED_COLLECTION = 'seed';
export const STORAGE_DATABASE = 'data-storage';
export const SEED_STORAGE_COLLECTION = 'seed-nursery-storage';

export const SEED_STORAGE_REQUEST = {
    storeManySeed: SEED_REQUEST_HEAD + STORAGE_REQUEST + INSERT_REQUEST
}

export function getDate(dateStr: string): string {
    const date = new Date(dateStr).toString();
    return (date === "Invalid Date") ? dateStr : date;
}