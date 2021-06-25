import { USER_COLLECTION } from "../../configs/mongodb-collection.config";
import { User } from "../models/user.model";

export async function findUser(phoneNumber: string, password: string): Promise<User[]> {
    const findCond = [
        {
            $match: { $and: [{ phoneNumber: phoneNumber }, { password: password }] }
        },
        {
            $project: { password: 0 }
        }
    ];
    const userArr = await USER_COLLECTION.aggregate(findCond);
    if (!userArr.length) {
        throw new Error("Wrong phone number or password.");
    }
    return userArr[0];
}