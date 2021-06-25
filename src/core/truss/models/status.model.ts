export class Status {
    date: Date;
    plantNumber: number;
    plantGrowth: number;
    constructor(status: { date?: Date, plantNumber?: number, plantGrowth?: number } = {}) {
        this.date = status.date ? new Date(status.date) : new Date();
        this.plantNumber = Number(status.plantNumber || 0);
        this.plantGrowth = Number(status.plantGrowth || 0);
    }
}