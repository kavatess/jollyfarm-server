import { UpdateWriteOpResult } from "mongodb";
import { USER_COLLECTION } from "../../configs/mongodb-collection.config";

export async function updateLoginPassword(phoneNumber: string, oldPassword: string, newPassword: string): Promise<UpdateWriteOpResult> {
    const authCond = { $and: [{ phoneNumber: phoneNumber }, { password: oldPassword }] };
    const updateMethod = { $set: { password: newPassword } };
    return await USER_COLLECTION.updateOne(authCond, updateMethod);
}