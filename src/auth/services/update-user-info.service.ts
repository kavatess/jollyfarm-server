import { UpdateWriteOpResult } from "mongodb";
import { USER_COLLECTION } from "../../configs/mongodb-collection.config";
import { UpdateUserBody } from "../models/update-user-body.model";

export async function updateUserInfo({ _id, name, dateOfBirth, address, idNumber, phoneNumber }: UpdateUserBody): Promise<UpdateWriteOpResult> {
    const updateMethod = {
        $set: {
            name: name,
            dateOfBirth: dateOfBirth,
            address: address,
            idNumber: idNumber,
            phoneNumber: phoneNumber
        }
    }
    return await USER_COLLECTION.updateOneById(_id, updateMethod);
}