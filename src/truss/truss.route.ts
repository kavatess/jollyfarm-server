import * as express from "express";
import { Router, Request, Response } from "express";
import { CreateTrussRequest, NewStatusRequest, RevertTrussRequest, UpdateMaxHoleRequest } from "./models/truss.request.model";
import { API_ROUTE_BEGIN } from "../server-constants";
import { getRawTrussArr, getTrussArrByBlock } from "./services/get-truss-arr.service";
import { getStatistics } from "./services/get-statistics.service";
import { updateTrussStatus } from "./services/update-truss-status.service";
import { createSeason } from "./services/create-season.service";
import { clearTruss } from "./services/clear-truss.service";
import { updateTrussMaxHole } from "./services/update-truss-maxhole.service";
import { revertTrussStatus } from "./services/revert-truss-status.service";

export const TrussRouter: Router = express.Router();

TrussRouter.post(API_ROUTE_BEGIN + '/truss/block/:block', async (req: Request, res: Response) => {
    try {
        const trussArr = await getTrussArrByBlock(req.params.block || '');
        res.json(trussArr);
    } catch (err) {
        res.sendStatus(405)
    }
});

TrussRouter.post(API_ROUTE_BEGIN + '/truss/raw/:block', async (req: Request, res: Response) => {
    try {
        const trussArr = await getRawTrussArr(req.params.block || '');
        res.json(trussArr);
    } catch (err) {
        res.sendStatus(405);
    }
});

TrussRouter.post(API_ROUTE_BEGIN + '/truss/statistics', async (req: Request, res: Response) => {
    try {
        const trussArr = await getStatistics(req.query);
        res.json(trussArr);
    } catch (err) {
        console.log(err);
        res.sendStatus(405);
    }
});

TrussRouter.post(API_ROUTE_BEGIN + '/truss/status/update', async (req: Request, res: Response) => {
    try {
        const response = await updateTrussStatus(req.body as NewStatusRequest);
        res.json(response);
    } catch (err) {
        res.sendStatus(405);
    }
});

TrussRouter.post(API_ROUTE_BEGIN + '/truss/create', async (req: Request, res: Response) => {
    try {
        const response = await createSeason(req.body as CreateTrussRequest);
        res.json(response);
    } catch (err) {
        res.sendStatus(405)
    }
});

TrussRouter.post(API_ROUTE_BEGIN + '/truss/clear/:id', async (req: Request, res: Response) => {
    try {
        const response = await clearTruss(req.params.id || '');
        res.json(response);
    } catch (err) {
        res.sendStatus(405)
    }
});

TrussRouter.post(API_ROUTE_BEGIN + '/truss/maxhole/update', async (req: Request, res: Response) => {
    try {
        const response = await updateTrussMaxHole(req.body as UpdateMaxHoleRequest);
        res.json(response);
    } catch (err) {
        res.sendStatus(405)
    }
});

TrussRouter.post(API_ROUTE_BEGIN + '/truss/status/revert', async (req: Request, res: Response) => {
    try {
        const response = await revertTrussStatus(req.body as RevertTrussRequest);
        res.json(response);
    } catch (err) {
        res.sendStatus(405)
    }
});