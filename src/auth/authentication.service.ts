import { MongoDB_Collection } from "../configs/collection-access.mongodb";
import { AUTHENTICATION_DATABASE, AUTH_TOKEN_SECRET, REFRESH_TOKEN_SECRET, USER_INFO_COLLECTION } from "../server-constants";
import { UserModel } from "./user.model";
import * as jwt from 'jsonwebtoken';

export class AuthService {
    private static userCollection: MongoDB_Collection = new MongoDB_Collection(AUTHENTICATION_DATABASE, USER_INFO_COLLECTION);
    private static refreshTokens: any = {};

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

    private static generateAuthToken(userInfo: UserModel): string {
        return jwt.sign(userInfo, AUTH_TOKEN_SECRET, { expiresIn: '3d' });
    }

    public static async firstLogin({ phoneNumber, password }: any): Promise<string | Error> {
        const userInfo = await this.findUser(phoneNumber, password);
        if (!userInfo.length) {
            return new Error("Wrong username or password.");
        }
        const refreshToken = jwt.sign(userInfo, REFRESH_TOKEN_SECRET);
        this.refreshTokens[refreshToken] = userInfo[0];
        return this.generateAuthToken(userInfo[0]);
    }

    public static async relogin(refreshToken: string) {
        if (refreshToken in this.refreshTokens) {
            return this.generateAuthToken(this.refreshTokens[refreshToken]);
        }
        return new Error("Invalid refresh token.");
    }

    public static logout(refreshToken: string) {
        if (refreshToken in this.refreshTokens) {
            delete this.refreshTokens[refreshToken];
        }
    }
}