// import { NextFunction } from "express";
// import { HookAsyncCallback } from "mongoose";
// import { AsyncHook } from "node:async_hooks";
// import { MongoDB_Collection } from "../configs/collection-access.mongodb";

// export abstract class Service {
//     private collection: MongoDB_Collection;
//     private repository: any[] = [];

//     constructor() {

//     }

//     protected abstract repoInit(): Promise<void>;
//     protected async resetRepo(): Promise<void> {
//         this.repository = [];
//         return await this.repoInit();
//     }
//     protected async createAction(asyncAction: Function): Promise<any> {
//         try {
//             await this.repoInit();
//             await asyncAction.call(this);
//         } catch (err) {
//             console.log(err);
//             return err;
//         }
//     }

//     createCallBack(): NextFunction {
//         return async () => {
//             console.log('hello');
//         }
//     }

//     doFunction(): void {
//         this.createCallBack().call(args)
//     }
// }

// export class ServiceFactory {
//     createService(serviceName: string): Service {
//         if ()
//     }
// }