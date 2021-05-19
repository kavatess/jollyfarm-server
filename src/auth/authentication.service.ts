import { MongoDB_Collection } from "../configs/collection-access.mongodb";
import { AUTHENTICATION_DATABASE, USER_INFO_COLLECTION } from "../server-constants";
import { UserModel } from "./user.model";

export class AuthService {
    private static userCollection: MongoDB_Collection = new MongoDB_Collection(AUTHENTICATION_DATABASE, USER_INFO_COLLECTION);

    private static async findUser(phoneNumber: string, password: string): Promise<UserModel[]> {
        const findCond = [
            {
                $match: { $and: [{ phoneNumber: phoneNumber }, { password: password }] }
            },
            {
                $project: { password: 0 }
            }
        ];
        return await this.userCollection.aggregate(findCond);
    }

    public static async verifyUser({ phoneNumber, password }: any): Promise<UserModel> {
        const userInfo = await this.findUser(phoneNumber, password);
        if (!userInfo.length) {
            throw new Error("Wrong phone number or password.")
        }
        return userInfo[0];
    }
}