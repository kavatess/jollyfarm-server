import { Response } from 'express';

function handleServerError(err: Error): void {
    console.log(err);
    return;
}

export function handleInvalidRequestError(err: Error, res: Response) {
    res.sendStatus(405);
    return handleServerError(err);
}

export function handleUnauthorizedRequestError(err: Error, res: Response) {
    res.sendStatus(401);
    return handleServerError(err);
}