import { InsertOneWriteOpResult } from "mongodb";
import { USER_COLLECTION } from "../../configs/mongodb-collection.config";
import { AUTH_ROLES, EMPLOYEE_AUTH_ARR } from "../../server-constants";
import { RegisterInfo } from "../models/register-info.model";
import { User } from "../models/user.model";

export async function registerUser(registration: RegisterInfo): Promise<InsertOneWriteOpResult<any>> {
    const newUser: User = {
        ...registration,
        role: AUTH_ROLES.EMPLOYEE,
        authorization: EMPLOYEE_AUTH_ARR
    }
    return await USER_COLLECTION.insertOne(newUser);
}