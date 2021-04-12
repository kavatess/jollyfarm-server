export const DB_URI = 'mongodb+srv://kavatess:2306@cluster0.gfleb.mongodb.net/test?retryWrites=true&w=majority';
export const DB_CONNECT_OPTIONS = { useNewUrlParser: true, useUnifiedTopology: true };
export const MAIN_DATABASE = 'farm-database';
export const STORAGE_DATABASE = 'data-storage';
export const TRUSS_COLLECTION = 'truss-final';
export const PLANT_COLLECTION = 'plant';
export const SEED_COLLECTION = 'seed';
export const SEED_STORAGE_COLLECTION = 'seed-nursery-storage';
export const REQUEST_URL_HEAD = '/api/v1';

export function getDate(dateStr: string): string {
    const date = new Date(dateStr).toString();
    return (date === 'Invalid Date') ? dateStr : date;
}