import { Status } from "../../truss/models/status.model";
import { Truss } from "../../truss/models/truss.model";

export class BasicHistory {
    trussId: string;
    plantId: string;
    startDate: Date;
    realStatus: Status[];
    createHistoryOfTruss(truss: Truss): BasicHistory {
        this.trussId = truss.id;
        this.plantId = truss.plantId;
        this.startDate = truss.startDate;
        this.realStatus = truss.realStatus;
        return this;
    }
}