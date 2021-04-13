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

export function getDate(dateStr: string): string {
    const date = new Date(dateStr).toString();
    return (date === 'Invalid Date') ? dateStr : date;
}

export function addDate(startDateStr: string, days: number): string {
    const startDate = new Date(startDateStr).getTime();
    return new Date(startDate + days * 24 * 3600 * 1000).toString();
}