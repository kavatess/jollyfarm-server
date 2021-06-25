export interface CreateTrussRequest {
    _id: string;
    seedId: string;
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
    plantNumber: number;
    plantGrowth: number;
}