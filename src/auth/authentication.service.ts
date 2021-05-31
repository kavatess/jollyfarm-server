import { MongoDB_Collection } from "../configs/mongodb-collection.config";
import { AUTH_ROLES, COLLECTION, DATABASE, EMPLOYEE_AUTH_ARR } from "../server-constants";
import { User, UpdateUserRequest, RegisterInfo } from "./user.model";

export class AuthService {
    private static userCollection: MongoDB_Collection = new MongoDB_Collection(DATABASE.AUTHENTICATION, COLLECTION.USER_INFO);

    public static async findUser(phoneNumber: string, password: string): Promise<User[]> {
        const findCond = [
            {
                $match: { $and: [{ phoneNumber: phoneNumber }, { password: password }] }
            },
            {
                $project: { password: 0 }
            }
        ];
        const userArr = await this.userCollection.aggregate(findCond);
        if (!userArr.length) {
            throw new Error("Wrong phone number or password.");
        }
        return userArr[0];
    }

    public static async changeUserInfo(userInfo: UpdateUserRequest) {
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

    public static async changeLoginPassword(phoneNumber: string, oldPassword: string, newPassword: string) {
        const authCond = { $and: [{ phoneNumber: phoneNumber }, { password: oldPassword }] };
        const updateMethod = { $set: { password: newPassword } };
        return await this.userCollection.updateOne(authCond, updateMethod);
    }

    public static async registerUser(registration: RegisterInfo) {
        const newUser: User = {
            ...registration,
            role: AUTH_ROLES.EMPLOYEE,
            authorization: EMPLOYEE_AUTH_ARR
        }
        return await this.userCollection.insertOne(newUser);
    }
}