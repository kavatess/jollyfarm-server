import { MongoDB_Collection } from "../../configs/collection-access.mongodb";
import { AUTHENTICATION_DATABASE, USER_INFO_COLLECTION } from "../../server-constants";
import { UpdateUserRequest } from "../models/update-user-request.model";
import { User } from "../models/user.model";

class AuthService {
    private userCollection: MongoDB_Collection = new MongoDB_Collection(AUTHENTICATION_DATABASE, USER_INFO_COLLECTION);

    private async findUser(phoneNumber: string, password: string): Promise<User[]> {
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

    public async verifyUser({ phoneNumber, password }: any): Promise<User> {
        const userInfo = await this.findUser(phoneNumber, password);
        if (!userInfo.length) {
            throw new Error("Wrong phone number or password.")
        }
        return userInfo[0];
    }

    public async changeUserInfo(userInfo: UpdateUserRequest) {
        const updateMethod = {
            $set: {
                name: userInfo.name,
                dateOfBirth: userInfo.dateOfBirth,
                address: userInfo.address,
                idNumber: userInfo.idNumber,
                phoneNumber: userInfo.phoneNumber
            }
        }
        return await this.userCollection.updateOneById(userInfo._id, updateMethod);
    }
}

export default new AuthService();