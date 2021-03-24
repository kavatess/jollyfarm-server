export const REQUEST_URL = "/api/v1";
export const TRUSS_REQUEST_HEAD = REQUEST_URL + "/truss";
export const PLANT_REQUEST_HEAD = REQUEST_URL + "/plant";
export const SEED_REQUEST_HEAD = REQUEST_URL + "/seed";
export const SEED_STORAGE_REQUEST_HEAD = REQUEST_URL + "/storage/seed";
export const UPDATE_REQUEST = "/update";
export const INSERT_REQUEST = "/insert";
export const DELETE_REQUEST = "/delete";
export const TRUSS_REQUEST_TAIL = {
    getTruss: '/:block',
    updateStatus: '/update/status',
    createTruss: '/create',
    clearTruss: '/clear',
    updateMaxHole: '/update/maxhole',
    revertStatus: '/revert/status',
    getTimelineById: '/timeline/:_id'
}
export const SEED_REQUEST_TAIL = {
    removeSeedAfterCreatedTruss: '/remove',
    saveSeedInStorage: '/storage' + INSERT_REQUEST
}

export function getDate(dateStr: string): string {
    const date = new Date(dateStr).toString();
    return (date === "Invalid Date") ? dateStr : date;
}