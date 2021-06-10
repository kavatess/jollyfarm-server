import * as express from "express";
import { Router, Request, Response } from "express";
import { API_ROUTE_BEGIN } from "../../server-constants";
import { getRawTrussArr, getTrussArrByBlock } from "./services/get-truss-arr.service";
import { getTotalStatistics } from "./services/get-statistics.service";
import { updateTrussStatus } from "./services/update-truss-status.service";
import { createSeason } from "./services/create-season.service";
import { clearTruss } from "./services/clear-truss.service";
import { updateTrussMaxHole } from "./services/update-truss-maxhole.service";
import { revertTrussStatus } from "./services/revert-truss-status.service";
import { handleInvalidRequestError } from "../../shared/services/error-handler.service";
import { checkTypeOfNumber, checkTypeOfString } from "../../shared/validators/type-check.validator";
import { getHarvestStatsByDate, getHarvestStatsByMonth } from "./services/get-record-stats.service";

export const TrussRouter: Router = express.Router();

TrussRouter.post(API_ROUTE_BEGIN + '/truss/block/:block', async (req: Request, res: Response) => {
    try {
        const block = req.params.block || 'all';
        const trussArr = await getTrussArrByBlock(block);
        res.json(trussArr);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

TrussRouter.post(API_ROUTE_BEGIN + '/truss/raw/:block', async (req: Request, res: Response) => {
    try {
        const block = req.params.block || '';
        const trussArr = await getRawTrussArr(block);
        res.json(trussArr);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

TrussRouter.post(API_ROUTE_BEGIN + '/truss/statistics', async (req: Request, res: Response) => {
    try {
        const { block, plantGrowth, plantId } = req.body;
        if (!checkTypeOfString(block) || !checkTypeOfNumber(plantGrowth) || !checkTypeOfString(plantId)) {
            throw new Error('Invalid request.')
        }
        const trussArr = await getTotalStatistics(block, plantGrowth, plantId);
        res.json(trussArr);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

TrussRouter.post(API_ROUTE_BEGIN + '/truss/status/update', async (req: Request, res: Response) => {
    try {
        const { _id, plantNumber, plantGrowth } = req.body;
        if (!checkTypeOfString(_id) || !checkTypeOfNumber(plantNumber) || !checkTypeOfNumber(plantGrowth)) {
            throw new Error('Invalid request.')
        }
        const response = await updateTrussStatus(_id, plantNumber, plantGrowth);
        res.json(response);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

TrussRouter.post(API_ROUTE_BEGIN + '/truss/create', async (req: Request, res: Response) => {
    try {
        const { _id, seedId } = req.body;
        if (!checkTypeOfString(_id) || !checkTypeOfString(seedId)) {
            throw new Error('Invalid request.');
        }
        const response = await createSeason(_id, seedId);
        res.json(response);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

TrussRouter.post(API_ROUTE_BEGIN + '/truss/clear/:id', async (req: Request, res: Response) => {
    try {
        const clearedTrussId = req.params.id || '';
        const response = await clearTruss(clearedTrussId);
        res.json(response);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

TrussRouter.post(API_ROUTE_BEGIN + '/truss/maxhole/update', async (req: Request, res: Response) => {
    try {
        const { _id, maxHole } = req.body
        if (!checkTypeOfString(_id) || !checkTypeOfNumber(maxHole)) {
            throw new Error('Invalid request.');
        }
        const response = await updateTrussMaxHole(_id, maxHole);
        res.json(response);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

TrussRouter.post(API_ROUTE_BEGIN + '/truss/status/revert', async (req: Request, res: Response) => {
    try {
        const { _id, statusIndex } = req.body;
        if (!checkTypeOfString(_id) || !checkTypeOfNumber(statusIndex)) {
            throw new Error('Invalid request.');
        }
        const response = await revertTrussStatus(_id, statusIndex);
        res.json(response);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

TrussRouter.post(API_ROUTE_BEGIN + '/truss/records/date', async (req: Request, res: Response) => {
    try {
        const { month, plantId } = req.body;
        if (!checkTypeOfNumber(month) || !checkTypeOfString(plantId)) {
            throw new Error('Invalid request.');
        }
        const harvestStatsByDate = await getHarvestStatsByDate(month, plantId);
        res.json(harvestStatsByDate);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

TrussRouter.post(API_ROUTE_BEGIN + '/truss/records/month/:plantId', async (req: Request, res: Response) => {
    try {
        const plantId = req.params.plantId || 'all';
        const harvestStatsByMonth = await getHarvestStatsByMonth(plantId);
        res.json(harvestStatsByMonth);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});