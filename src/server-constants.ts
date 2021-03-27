export const REQUEST_URL = "/api/v1";
export const TRUSS_REQUEST_HEAD = REQUEST_URL + "/truss";
export const PLANT_REQUEST_HEAD = REQUEST_URL + "/plant";
export const SEED_REQUEST_HEAD = REQUEST_URL + "/seed";
export const SEED_STORAGE_REQUEST_HEAD = REQUEST_URL + "/storage/seed";
export const UPDATE_REQUEST = "/update";
export const INSERT_REQUEST = "/insert";
export const DELETE_REQUEST = "/delete";
export const TRUSS_REQUEST = {
    getTruss: TRUSS_REQUEST_HEAD + '/block/:block',
    getStatistics: TRUSS_REQUEST_HEAD + '/statistics',
    updateStatus: TRUSS_REQUEST_HEAD + '/update/status',
    createTruss: TRUSS_REQUEST_HEAD + '/create',
    clearTruss: TRUSS_REQUEST_HEAD + '/clear',
    updateMaxHole: TRUSS_REQUEST_HEAD + '/update/maxhole',
    revertStatus: TRUSS_REQUEST_HEAD + '/revert/status',
    getTimelineById: TRUSS_REQUEST_HEAD + '/timeline/:id'
}
export const SEED_REQUEST_TAIL = {
    removeSeedAfterCreatedTruss: SEED_REQUEST_HEAD + '/remove',
    saveSeedInStorage: SEED_REQUEST_HEAD + '/storage' + INSERT_REQUEST
}

export function getDate(dateStr: string): string {
    const date = new Date(dateStr).toString();
    return (date === "Invalid Date") ? dateStr : date;
}