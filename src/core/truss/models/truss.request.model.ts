export interface CreateTrussRequest {
    _id: string;
    seedId: string;
    startDate: string;
}

export interface UpdateMaxHoleRequest {
    _id: string;
    maxHole: number;
}

export interface RevertTrussRequest {
    _id: string;
    statusIndex: number;
}

export interface NewStatusRequest {
    _id: string;
    date: Date;
    plantNumber: number;
    plantGrowth: number;
}

export interface GetStatisticsQuery {
    block: string;
    plantGrowth: number;
    plantId: string;
}