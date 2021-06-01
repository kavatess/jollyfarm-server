import * as express from "express";
import { Router, Request, Response } from "express";
import { CreateTrussRequest, NewStatusRequest, RevertTrussRequest, UpdateMaxHoleRequest } from "./models/truss.request.model";
import { API_ROUTE_BEGIN } from "../../server-constants";
import { getRawTrussArr, getTrussArrByBlock } from "./services/get-truss-arr.service";
import { getStatistics } from "./services/get-statistics.service";
import { updateTrussStatus } from "./services/update-truss-status.service";
import { createSeason } from "./services/create-season.service";
import { clearTruss } from "./services/clear-truss.service";
import { updateTrussMaxHole } from "./services/update-truss-maxhole.service";
import { revertTrussStatus } from "./services/revert-truss-status.service";
import { handleInvalidRequestError } from "../../shared/error-handler.service";

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
        const { block, plantGrowth, plantId }: any = req.query;
        const trussArr = await getStatistics(block, plantGrowth, plantId);
        res.json(trussArr);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

TrussRouter.post(API_ROUTE_BEGIN + '/truss/status/update', async (req: Request, res: Response) => {
    try {
        const { _id, plantNumber, plantGrowth }: NewStatusRequest = req.body;
        const response = await updateTrussStatus(_id, plantNumber, plantGrowth);
        res.json(response);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

TrussRouter.post(API_ROUTE_BEGIN + '/truss/create', async (req: Request, res: Response) => {
    try {
        const { _id, seedId }: CreateTrussRequest = req.body;
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
        const { _id, maxHole }: UpdateMaxHoleRequest = req.body
        const response = await updateTrussMaxHole(_id, maxHole);
        res.json(response);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});

TrussRouter.post(API_ROUTE_BEGIN + '/truss/status/revert', async (req: Request, res: Response) => {
    try {
        const { _id, statusIndex }: RevertTrussRequest = req.body;
        const response = await revertTrussStatus(_id, statusIndex);
        res.json(response);
    } catch (err) {
        return handleInvalidRequestError(err, res);
    }
});