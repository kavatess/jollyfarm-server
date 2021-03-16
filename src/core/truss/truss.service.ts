import { mongoDB_Collection } from "../../configs/collection-access.mongodb";
import { mongoDatabase } from "../../configs/connect.mongodb";
import { plantController } from "../plant/plant.controller";
import { Plant } from "../plant/plant.model";
import { createTrussRequest, EmptyTruss, History, HistoryModel, newStatusRequest, Status, Truss, TrussBasicInfo, TrussDataStruct, TrussModel, TrussModelForClientSide } from "./truss.model";

export class trussService extends mongoDB_Collection {
    private trussExtendedData: EmptyTruss[] = [];
    private processedTrussData: (TrussModelForClientSide | TrussBasicInfo)[] = [];

    protected constructor() {
        super(mongoDatabase.getDB(), "truss-data")
    }

    protected async getTrussData() {
        if (!this.trussExtendedData.length) {
            const trussData: TrussDataStruct[] = await this.joinWithPlantData();
            this.trussExtendedData = trussData.map(truss => {
                if (truss.plantId) {
                    const trussEl = new Truss(truss);
                    this.autoUpdateTrussStatus(trussEl);
                    return trussEl;
                }
                return new EmptyTruss(truss);;
            });
        }
    }

    private async resetTrussData() {
        this.trussExtendedData = [];
        await this.getTrussData();
        this.processedTrussData = [];
        await this.getTrussDataForClient();
    }

    protected async getTrussDataForClient() {
        if (!this.processedTrussData.length) {
            await this.getTrussData();
            this.processedTrussData = this.trussExtendedData.map(truss => {
                return truss.clientTrussData;
            })
        }
        return this.processedTrussData;
    }

    private async autoUpdateTrussStatus(trussEl: Truss) {
        if (trussEl.realPlantGrowth > trussEl.latestPlantGrowth) {
            const today = new Date().toLocaleDateString('es-PA');
            const updateReq = new newStatusRequest(trussEl._id, today, trussEl.latestPlantNumber, trussEl.realPlantGrowth)
            return await this.updateTrussStatus(updateReq);
        }
    }

    protected async updateTrussStatus(newStatusRequest: newStatusRequest) {
        const newStatus: Status = new Status(newStatusRequest.date, newStatusRequest.plantNumber, newStatusRequest.plantGrowth);
        const updateVal = { $push: { statusReal: newStatus } };
        await this.updateOne(newStatusRequest._id, updateVal);
        if (!newStatus.plantNumber) {
            return await this.clearTruss(newStatusRequest._id);
        }
        return await this.resetTrussData();
    }

    protected async clearTruss(clearedTrussId: string) {
        const clearedTruss: TrussModel = await this.getDocumentById(clearedTrussId);
        const newHistory: History = new HistoryModel(clearedTruss.plantId, clearedTruss.startDate, clearedTruss.statusReal, clearedTruss.statusPredict);
        const history = clearedTruss.history.push(newHistory);
        const updateVal = {
            $set: {
                plantId: 0,
                startDate: '',
                statusReal: [],
                statusPredict: [],
                history: history
            }
        }
        await this.updateOne(clearedTrussId, updateVal);
        return await this.resetTrussData();
    }

    protected async createNewTruss(newTrussReq: createTrussRequest) {
        const emptyTruss = this.trussExtendedData.find(truss => truss._id == newTrussReq._id);
        if (!(emptyTruss?.plantId)) {
            emptyTruss?.createStatusReal(newTrussReq.plantNumber);
            const plantType: Plant = await new plantController().getPlantType(newTrussReq.plantId);
            emptyTruss?.createStatusPredict(plantType.mediumGrowthTime, plantType.growUpTime);
            const updateVal = {
                $set: {
                    plantId: newTrussReq.plantId,
                    startDate: newTrussReq.startDate,
                    statusReal: emptyTruss?.statusReal,
                    statusPredict: emptyTruss?.statusPredict
                }
            }
            await this.updateOne(newTrussReq._id, updateVal);
            return await this.resetTrussData();
        }
    }

    protected async updateTrussMaxHole(newMaxHole: any) {
        const updateVal = { $set: { maxHole: newMaxHole.maxHole } };
        await this.updateOne(newMaxHole._id, updateVal);
        return await this.resetTrussData();
    }
}